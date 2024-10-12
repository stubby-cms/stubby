import { getSession } from "@/lib/auth";
import { defaultPageContent, defaultPageContentOutput } from "@/lib/consts";
import prisma from "@/lib/prisma";
import { getId } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const sites = await prisma.site.findMany({
      where: {
        user: {
          id: session.user.id as string,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(sites);
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: "failure", data: error.message },
      { status: 400 },
    );
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const name = data.siteName;
  const description = data.description;

  try {
    const siteId = getId();
    const response = await prisma.site.create({
      data: {
        id: siteId,
        name,
        description,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    const nodeId = getId(4);

    const pageResponse = await prisma.node.create({
      data: {
        id: nodeId,
        siteId: siteId,
        name: "getting-started",
        isFolder: false,
        parentId: null,
        userId: session.user.id,
        content: defaultPageContent,
        draft: defaultPageContent,
        output: defaultPageContentOutput,
        slug: `getting-started-${nodeId}`,
        title: "Getting Started",
      },
    });

    return NextResponse.json({
      message: "success",
      data: response,
      pageId: pageResponse.id,
    });
  } catch (error: any) {
    let err = error;

    return NextResponse.json(
      { message: "failure", data: err },
      { status: 400 },
    );
  }
}
