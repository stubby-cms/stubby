import { createErrorResponse } from "@/app/api/utils/errors";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getRootFolder } from "./get-root-folder";

const messages = {
  apiKey: `Invalid api key, refer ${process.env.NEXT_PUBLIC_HOST}/docs`,
  siteId: `Missing site id, refer ${process.env.NEXT_PUBLIC_HOST}/docs`,
  siteNotFound: "Site not found",
};

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ siteId: string }>;
  },
) {
  const { siteId } = await params;
  const searchParams = req.nextUrl.searchParams;

  try {
    const apiKey = searchParams.get("apiKey");

    if (!siteId) return createErrorResponse(messages.siteId, 400);
    if (!apiKey) return createErrorResponse(messages.apiKey, 400);

    const siteData = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!siteData) return createErrorResponse(messages.siteNotFound, 404);

    if (siteData.apiKey !== apiKey)
      return createErrorResponse(messages.apiKey, 400);

    return getRootFolder(siteId);
  } catch (error: any) {
    return createErrorResponse(error.message, 400);
  }
}
