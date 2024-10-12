import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { type Webhook } from "@prisma/client";

export const PATCH = async (
  req: NextRequest,
  {
    params: { siteId },
  }: {
    params: { siteId: string };
  },
) => {
  const data = (await req.json()) as Webhook;
  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteData = await prisma.site.findUnique({
    where: {
      id: siteId,
    },
  });

  if (!siteData || siteData.userId !== session.user.id) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  try {
    const webhook = await prisma.webhook.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
      },
    });

    return NextResponse.json({ message: "success", data: webhook });
  } catch (error) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};

export const GET = async (
  req: NextRequest,
  {
    params: { siteId },
  }: {
    params: { siteId: string };
  },
) => {
  const session = await getSession();
  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  const type = (searchParams.get("type") as Webhook["type"]) ?? "updated";

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteData = await prisma.site.findUnique({
    where: {
      id: siteId as string,
    },
  });

  if (!siteData || siteData.userId !== session.user.id) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  try {
    const webhooks = await prisma.webhook.findFirst({
      where: {
        siteId: siteId as string,
        type: type,
      },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  {
    params: { siteId },
  }: {
    params: { siteId: string };
  },
) => {
  const data = (await req.json()) as Webhook;
  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteData = await prisma.site.findUnique({
    where: {
      id: siteId,
    },
  });

  if (!siteData || siteData.userId !== session.user.id) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  try {
    const webhook = await prisma.webhook.create({
      data: {
        ...data,
        siteId: siteId,
      },
    });

    return NextResponse.json({ message: "success", data: webhook });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
};
