import { getSession } from "@/lib/auth";
import { extractFrontMatter } from "@/lib/frontmatter";
import prisma from "@/lib/prisma";
import { getId } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { getToc } from "./[siteId]/nodes/[nodeId]/md";
import md from "./onboarding/intro.mdx";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const sites = await prisma.site.findMany({
      where: {
        owner: {
          id: session.user.id as string,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(sites);
  } catch (error: any) {
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

  console.log("------ 1");

  try {
    const siteId = getId();

    const response = await prisma.site.create({
      data: {
        id: siteId,
        name,
        description,
        owner: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    const nodeId = getId(6);

    console.log("------ 2");

    const { content, data } = extractFrontMatter(md.toString());
    const toc = getToc(content);

    console.log("------ 3");

    const pageResponse = await prisma.node.create({
      data: {
        id: nodeId,
        siteId: siteId,
        name: "getting-started",
        isFolder: false,
        parentId: null,
        ownerId: session.user.id,
        content: md.toString(),
        draft: md.toString(),
        slug: `getting-started-${nodeId}`,
        title: "Getting Started",
        output: {
          toc,
          metadata: data ?? {},
        },
      },
    });

    console.log("------ 4");

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
