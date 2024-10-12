import { getSession } from "@/lib/auth";
import { extractFrontMatter } from "@/lib/extract-frontmatter";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { MdPreview, getToc } from "./md";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { siteId: string; nodeId: string } },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const nodes = await prisma.node.delete({
    where: {
      id: params.nodeId,
    },
  });

  return NextResponse.json({ message: "success", data: nodes });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string; nodeId: string } },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const node = await prisma.node.findUnique({
      where: {
        id: params.nodeId,
        siteId: params.siteId,
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
  { params }: { params: { siteId: string; nodeId: string } },
) {
  const session = await getSession();
  const data = await req.json();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const newData: any = {};

  if (data.name) {
    newData["name"] = data.name;
  }

  if (data.slug) {
    newData["slug"] = data.slug;
  }

  if (data.draft) {
    newData["draft"] = data.draft;
  }

  if (data.content) {
    newData["content"] = data.content;
    newData["publishedAt"] = new Date();
    newData["isPublished"] = true;

    const { content, data: fm } = extractFrontMatter(data.content);
    const ReactDOMServer = (await import("react-dom/server")).default;
    let html = ReactDOMServer.renderToString(MdPreview(content));
    const toc = getToc(data.content);

    const output = {
      html: html,
      toc: toc,
      frontmatter: fm,
    };

    if (fm) {
      if (fm.slug) {
        newData["slug"] = fm.slug;
      } else if (fm.title || fm.name) {
        if (fm.name) newData["slug"] = slugify(fm.name);
        if (fm.title) newData["slug"] = slugify(fm.title);
      }

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

  if (data.slug) {
    newData["slug"] = slugify(data.slug);
  }

  try {
    const node = await prisma.node.update({
      where: {
        id: params.nodeId,
      },
      data: newData,
    });

    let hookResponse = null;

    if (newData.content) {
      const hook = await prisma.webhook.findFirst({
        where: {
          siteId: params.siteId,
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

          if (hook.includeSlug) {
            url.searchParams.append("slug", node.slug);
          }

          if (hook.includeId) {
            url.searchParams.append("id", node.id);
          }

          if (hook.includeName) {
            url.searchParams.append("name", node.name);
          }

          const res = await fetch(url.href, options);
          hookResponse = res.ok && res.status === 200 ? true : false;
        }

        const response: any = {
          message: "success",
          id: node.id,
        };

        if (hookResponse != null) {
          response["hook"] = hookResponse ? "success" : "failure";
        }

        return NextResponse.json(response);
      } catch (err) {
        return NextResponse.json({
          message: "success",
          id: node.id,
          hook: false,
        });
      }
    }

    return NextResponse.json({ message: "success", id: node.id });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "error", data: "Slug is already taken" },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { message: "error", data: err },
        { status: 400 },
      );
    }
  }
}
