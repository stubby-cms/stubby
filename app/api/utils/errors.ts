import { NextResponse } from "next/server";

const ErrorTypes: Record<number, string> = {
  404: "Not Found",
  401: "Unauthorized",
  500: "Internal Server Error",
  400: "Bad Request",
};

// Helper function to create error responses
export const createErrorResponse = (message: string, status: number) => {
  return NextResponse.json(
    {
      error: {
        code: status,
        message: message,
        type: ErrorTypes[status],
      },
    },
    { status },
  );
};

// Helper function to create success responses
export const createSuccessResponse = (data: any) => {
  return NextResponse.json({ data, success: true });
};
