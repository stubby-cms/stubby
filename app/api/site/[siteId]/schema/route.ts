import {
  createErrorResponse,
  createSuccessResponse,
} from "@/app/api/utils/errors";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isUserAuthorized } from "../utils";
import { Schema } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const session = await getSession();

  if (!session) return createErrorResponse("Unauthorized", 401);
  if (!isUserAuthorized(siteId, session.user.id))
    return createErrorResponse("Unauthorized", 401);

  let schemaList = await prisma.schema.findMany({
    where: {
      siteId: siteId,
    },
  });

  if (!schemaList) schemaList = [];

  return NextResponse.json(schemaList);
}

export const POST = async (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ siteId: string }>;
  },
) => {
  const data = (await req.json()) as Schema;
  const session = await getSession();
  const siteId = (await params).siteId;

  if (!session) return createErrorResponse("Unauthorized", 401);
  if (!isUserAuthorized(siteId, session.user.id))
    return createErrorResponse("Unauthorized", 401);

  try {
    const schema = await prisma.schema.create({
      data: {
        ...data,
        siteId: siteId,
      },
    });

    return createSuccessResponse(schema);
  } catch (error) {
    return createErrorResponse(JSON.stringify(error), 500);
  }
};
