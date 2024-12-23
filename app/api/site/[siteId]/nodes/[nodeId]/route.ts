import { createErrorResponse } from "@/app/api/utils/errors";
import { getSession } from "@/lib/auth";
import { extractFrontMatter } from "@/lib/frontmatter";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getToc } from "./md";

const checkIfUserCanUpdateSite = async (siteId: string, ownerId: string) => {
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      ownerId: ownerId,
    },
  });

  return site ? true : false;
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; nodeId: string }> },
) {
  const { nodeId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const nodes = await prisma.node.delete({
    where: {
      id: nodeId,
    },
  });

  return NextResponse.json({ message: "success", data: nodes });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; nodeId: string }> },
) {
  const session = await getSession();
  const { siteId, nodeId } = await params;

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const node = await prisma.node.findUnique({
      where: {
        id: nodeId,
        siteId: siteId,
      },
    });

    if (!node) {
      return NextResponse.json(
        { message: "error", data: "Node not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(node);
  } catch (err) {
    return NextResponse.json({ message: "error", data: err }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string; nodeId: string }> },
) {
  const { siteId, nodeId } = await params;
  const session = await getSession();
  const data = await req.json();

  if (!session || !(await checkIfUserCanUpdateSite(siteId, session.user.id))) {
    return createErrorResponse(
      "You are not authorized to update this node",
      403,
    );
  }

  const newData: any = {};

  if (data.name) newData["name"] = data.name;
  if (data.slug) newData["slug"] = data.slug;
  if (data.draft) newData["draft"] = data.draft;
  if (data.schemaId) newData["schemaId"] = data.schemaId;

  // db
  if (data.type === "db") newData["type"] = "db";
  if (data.dbContent) newData["dbContent"] = data.dbContent;
  if (data.dbCols) newData["dbCols"] = data.dbCols;

  if (data.content) {
    newData["content"] = data.content;
    newData["publishedAt"] = new Date();
    newData["isPublished"] = true;

    const { content, data: fm } = extractFrontMatter(data.content);
    const toc = getToc(content);

    const output = {
      toc: toc,
      metadata: fm,
    };

    if (fm) {
      if (fm.slug) newData["slug"] = fm.slug;
      if (fm.title) newData["title"] = fm.title;
    }

    newData["output"] = output ?? {};
  }

  if (data.parentId) {
    newData["parentId"] = data.parentId;

    if (data.parentId === "root") {
      newData["parentId"] = null;
    }
  }

  if (data.slug) newData["slug"] = slugify(data.slug);

  let node = null;

  try {
    node = await prisma.node.update({
      where: {
        id: nodeId,
      },
      data: newData,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2002":
          return createErrorResponse(
            "Page with the same slug already exists",
            400,
          );
        case "P2025":
          return createErrorResponse("Node not found", 404);
        default:
          return createErrorResponse("Failed to update node", 500);
      }
    } else {
      return createErrorResponse("Failed to update node", 500);
    }
  }

  let hookResponse = null;

  if (newData.content) {
    const hook = await prisma.webhook.findFirst({
      where: {
        siteId: siteId,
        type: "updated",
      },
    });

    try {
      if (hook) {
        let options: any = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        };

        if (hook.method == "get") {
          options = {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          };
        }

        const url = new URL(hook.url);

        if (hook.includeSlug) url.searchParams.append("slug", node.slug);
        if (hook.includeId) url.searchParams.append("id", node.id);
        if (hook.includeName) url.searchParams.append("name", node.name);

        const res = await fetch(url.href, options);
        hookResponse = res.ok && res.status === 200 ? true : false;
      }

      return NextResponse.json({
        success: true,
        data: hookResponse ? "success" : "failure",
      });
    } catch (err) {
      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ success: true });
}
