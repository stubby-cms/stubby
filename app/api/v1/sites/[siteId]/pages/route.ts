import { createErrorResponse } from "@/app/api/utils/errors";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return createErrorResponse(
    `One of page id or slug is required, refer ${process.env.NEXT_PUBLIC_HOST}/docs`,
    400,
  );
}
