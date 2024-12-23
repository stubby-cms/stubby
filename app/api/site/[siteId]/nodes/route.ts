import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getId, slugify } from "@/lib/utils";

import defaultContent from "@/app/api/site/onboarding/placeholder.mdx";
import { defaultDbCols, defaultDbContent } from "../../onboarding/db-defaults";
import { extractFrontMatter } from "@/lib/frontmatter";
import { getToc } from "./[nodeId]/md";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const nodes = await prisma.node.findMany({
    where: {
      siteId: siteId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isFolder: true,
      parentId: true,
      type: true,
    },
  });

  return NextResponse.json(nodes);
}

// Create a new node
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const data = await req.json();
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteId = (await params).siteId;

  const { content: defaultContentOnly, data: defaultContentMetadata } =
    extractFrontMatter(defaultContent.toString());
  const toc = getToc(defaultContentOnly);

  const nodeId = getId();
  const content = data.isFolder ? "" : defaultContent.toString();
  const draft = data.isFolder ? "" : defaultContent.toString();
  const output = data.isFolder
    ? ""
    : {
        toc,
        metadata: defaultContentMetadata,
      };
  const title = data.title ? data.title : data.name ? data.name : "Untitled";
  const dbContent = data.content ? data.content : defaultDbContent;
  const dbCols = data.dbCols ? data.dbCols : defaultDbCols;
  const slug = data.slug ? data.slug : slugify(`${title}-${nodeId}`);

  try {
    const node = await prisma.node.create({
      data: {
        id: nodeId,
        siteId: siteId,
        name: data.name,
        isFolder: data.isFolder,
        parentId: data.parentId,
        ownerId: session.user.id,
        content: content,
        draft: draft,
        output: output,
        slug: slug,
        title: title,
        type: data.type,
        dbContent: dbContent,
        dbCols: dbCols,
      },
    });

    return NextResponse.json({
      message: "success",
      id: node.id,
      isFolder: node.isFolder,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "error", data: "This node already exists" },
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
