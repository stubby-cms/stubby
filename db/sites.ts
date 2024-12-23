"use server";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const getAllSites = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

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

  return sites;
};

export const getSite = async (siteId: string) => {
  const site = await prisma.site.findUnique({
    where: {
      id: siteId,
    },
  });

  return site;
};

export const getNodes = async (siteId: string) => {
  const nodes = await prisma.node.findMany({
    where: {
      site: {
        id: siteId,
      },
    },
    select: {
      id: true,
      name: true,
      isFolder: true,
      parentId: true,
    },
  });

  return nodes;
};

export const getNode = async (nodeId: string) => {
  const node = await prisma.node.findUnique({
    where: {
      id: nodeId,
    },
  });

  return node;
};
