import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteId = (await params).siteId;

  try {
    const response = await prisma.site.delete({
      where: {
        id: siteId,
      },
    });

    return NextResponse.json({ message: "success", data: response });
  } catch (error: any) {
    return NextResponse.json(
      { message: "failure", data: error.message },
      { status: 400 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteId = (await params).siteId;

  try {
    const response = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (response?.ownerId !== session.user.id) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { message: "failure", data: error.message },
      { status: 400 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ siteId: string }>;
  },
) {
  const data = await req.json();

  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const siteId = (await params).siteId;

  try {
    const response = await prisma.site.update({
      where: {
        id: siteId,
      },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return NextResponse.json({ message: "success", data: response });
  } catch (error: any) {
    return NextResponse.json(
      { message: "failure", data: error.message },
      { status: 400 },
    );
  }
}
