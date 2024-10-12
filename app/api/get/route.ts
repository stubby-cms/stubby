import { NextRequest, NextResponse } from "next/server";
import { getAllPages } from "./actions/all-pages";
import { getAPage } from "./actions/a-page";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type RequestFor = "aPage" | "allPages";

const apiKeyErrorResponse = () => {
  return NextResponse.json(
    {
      message: `Invalid api key, refer ${process.env.NEXT_PUBLIC_HOST}/docs/get-all-pages`,
    },
    { status: 400 },
  );
};

const siteIdErrorResponse = () => {
  return NextResponse.json(
    {
      message: `Missing site id, refer ${process.env.NEXT_PUBLIC_HOST}/docs/get-all-pages`,
    },
    { status: 400 },
  );
};

const siteNotFoundErrorResponse = () => {
  return NextResponse.json({ message: "Site not found" }, { status: 404 });
};

const requestForFieldErrorResponse = () => {
  return NextResponse.json(
    {
      message: `Invalid requestFor field. It should be one of 'aPage' or 'allPages', refer ${process.env.NEXT_PUBLIC_HOST}/docs/get-all-pages`,
    },
    { status: 400 },
  );
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { siteId, requestFor } = data;
    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!siteId) return siteIdErrorResponse();
    if (!authorization) return apiKeyErrorResponse();
    const [, apiKeyFromHeader] = authorization.split(" ");
    if (!apiKeyFromHeader) return apiKeyErrorResponse();

    const siteData = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!siteData) return siteNotFoundErrorResponse();
    if (siteData.apiKey !== apiKeyFromHeader) return apiKeyErrorResponse();

    switch (requestFor as RequestFor) {
      case "aPage":
        return getAPage(data);
      case "allPages":
        return getAllPages(data);
      default:
        return requestForFieldErrorResponse();
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  try {
    const siteId = params.get("siteId");
    const action = params.get("requestFor") as RequestFor;
    const apiKey = params.get("apiKey");

    const headersList = headers();
    const authorization = headersList.get("authorization");

    if (!siteId) return siteIdErrorResponse();
    if (!authorization && !apiKey) return apiKeyErrorResponse();
    const [, apiKeyFromHeader] = authorization?.split(" ") || [];
    if (!apiKeyFromHeader && !apiKey) return apiKeyErrorResponse();

    const siteData = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });

    if (!siteData) return siteNotFoundErrorResponse();
    if (siteData.apiKey !== apiKeyFromHeader && siteData.apiKey !== apiKey)
      return apiKeyErrorResponse();

    switch (action) {
      case "aPage":
        return getAPage({
          siteId,
          pageSlug: params.get("pageSlug"),
          pageId: params.get("pageId"),
        });
      case "allPages":
        return getAllPages({
          siteId,
          options: {
            flat: params.get("flat") === "true",
          },
        });
      default:
        return requestForFieldErrorResponse();
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: error.message },
      { status: 400 },
    );
  }
}
