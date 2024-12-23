import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getId } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ siteId: string }>;
  },
) => {
  const { siteId } = await params;
  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteData = await prisma.site.findUnique({
    where: {
      id: siteId,
    },
  });

  if (!siteData || siteData.ownerId !== session.user.id) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  try {
    await prisma.site.update({
      where: {
        id: siteId,
      },
      data: {
        apiKey: getId(24),
      },
    });

    return NextResponse.json({ message: "success" });
  } catch (error) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
