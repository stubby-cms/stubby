import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createTree } from "./utils";
import { createErrorResponse } from "@/app/api/utils/errors";

export async function getAllPageWithLessData(siteId: string) {
  const response = await prisma.node.findMany({
    orderBy: {
      name: "asc",
    },
    where: {
      siteId: siteId,
      isFolder: false,
      isPublished: true,
    },
    select: {
      id: true,
      parentId: true,
      updatedAt: true,
      slug: true,
    },
  });
  return response;
}

async function getAllPagesFn(siteId: string) {
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
      type: true,
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return response;
}

export async function getRootFolder(siteId: string, flat: boolean = false) {
  try {
    const response = await getAllPagesFn(siteId);

    let updatedResponse = response.map((node) => {
      const { owner, ...rest } = node;

      return {
        ...rest,
        author: owner,
      };
    });

    // Filter out all the db nodes
    updatedResponse = updatedResponse.filter((node) => node.type != "db");

    if (flat) return NextResponse.json(updatedResponse);
    const tree = createTree(updatedResponse as any);
    return NextResponse.json(tree);
  } catch (error: any) {
    return createErrorResponse(error.message, 400);
  }
}
