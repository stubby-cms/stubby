import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getId, slugify } from "@/lib/utils";
import { defaultPageContent, defaultPageContentOutput } from "@/lib/consts";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const nodes = await prisma.node.findMany({
    where: {
      siteId: params.siteId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isFolder: true,
      parentId: true,
    },
  });

  return NextResponse.json(nodes);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { siteId: string } },
) {
  const data = await req.json();
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteId = params.siteId;

  const nodeId = getId();
  const content = data.isFolder ? "" : defaultPageContent;
  const draft = data.isFolder ? "" : defaultPageContent;
  const output = data.isFolder ? "" : defaultPageContentOutput;
  const title = data.title ? data.title : data.name ? data.name : "Untitled";
  const slug = data.slug ? data.slug : slugify(`${title}-${nodeId}`);

  try {
    const node = await prisma.node.create({
      data: {
        id: nodeId,
        siteId: siteId,
        name: data.name,
        isFolder: data.isFolder,
        parentId: data.parentId,
        userId: session.user.id,
        content: content,
        draft: draft,
        output: output,
        slug: slug,
        title: title,
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
