import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createTree } from "./utils";

export async function getAllPagesFn(siteId: string) {
  const response = await prisma.node.findMany({
    orderBy: {
      name: "asc",
    },
    where: {
      siteId: siteId,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      parentId: true,
      name: true,
      slug: true,
      title: true,
      output: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return response;
}

export async function getAllPages(data: any) {
  const { siteId, options } = data;

  try {
    const response = await getAllPagesFn(siteId);
    if (options?.flat) return NextResponse.json(response);
    const tree = createTree(response as any);
    return NextResponse.json(tree);
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 400 },
    );
  }
}
