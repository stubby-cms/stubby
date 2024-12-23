import prisma from "@/lib/prisma";

export const isUserAuthorized = async (siteId: string, ownerId: string) => {
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      ownerId: ownerId,
    },
  });

  return site ? true : false;
};
