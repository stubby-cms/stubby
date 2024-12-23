import {
  createErrorResponse,
  createSuccessResponse,
} from "@/app/api/utils/errors";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Schema } from "@prisma/client";
import { NextRequest } from "next/server";
import { isUserAuthorized } from "../../utils";

export const PATCH = async (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ siteId: string; schemaId: string }>;
  },
) => {
  const data = (await req.json()) as Schema;
  const session = await getSession();
  const siteId = (await params).siteId;
  const schemaId = (await params).schemaId;

  if (!session) return createErrorResponse("Unauthorized", 401);
  if (!isUserAuthorized(siteId, session.user.id))
    return createErrorResponse("Unauthorized", 401);

  try {
    const schema = await prisma.schema.update({
      where: {
        id: schemaId,
      },
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

export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ siteId: string; schemaId: string }>;
  },
) => {
  const session = await getSession();
  const siteId = (await params).siteId;
  const schemaId = (await params).schemaId;

  if (!session) return createErrorResponse("Unauthorized", 401);
  if (!isUserAuthorized(siteId, session.user.id))
    return createErrorResponse("Unauthorized", 401);

  try {
    await prisma.schema.delete({
      where: {
        id: schemaId,
      },
    });

    return createSuccessResponse({});
  } catch (error) {
    return createErrorResponse(JSON.stringify(error), 500);
  }
};
