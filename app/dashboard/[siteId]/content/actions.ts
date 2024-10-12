"use server";

import prisma from "@/lib/prisma";

export const getSite = async (siteId: string) => {
  const site = await prisma.site.findUnique({
    where: {
      id: siteId,
    },
  });

  return site;
};
