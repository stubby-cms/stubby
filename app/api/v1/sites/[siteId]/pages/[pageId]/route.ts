import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { createErrorResponse } from "../../../../../utils/errors";
import { getAPage } from "./get-a-page";

const messages = {
  apiKey: `Invalid api key, refer ${process.env.NEXT_PUBLIC_HOST}/docs`,
  siteId: `Missing site id, refer ${process.env.NEXT_PUBLIC_HOST}/docs`,
  siteNotFound: "Site not found",
  pageId: `One of page id or slug is required, refer ${process.env.NEXT_PUBLIC_HOST}/docs`,
};

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ siteId: string; pageId: string }>;
  },
) {
  const { siteId, pageId } = await params;
  const searchParams = req.nextUrl.searchParams;

  try {
    const apiKey = searchParams.get("apiKey");

    if (!siteId) return createErrorResponse(messages.siteId, 400);
    if (!apiKey) return createErrorResponse(messages.apiKey, 400);
    if (!pageId) return createErrorResponse(messages.pageId, 400);

    const siteData = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!siteData) return createErrorResponse(messages.siteNotFound, 404);
    if (siteData.apiKey !== apiKey)
      return createErrorResponse(messages.apiKey, 400);

    return getAPage(siteId, pageId);
  } catch (error: any) {
    return createErrorResponse(error.message, 400);
  }
}
