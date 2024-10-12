"use client";

import Link from "next/link";

const ErrorPage = () => {
  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <div className="h-10"></div>
        <div className="flex flex-col items-center justify-center gap-4">
          <h2 className="text-3xl font-semibold text-brand">
            Some thing went wrong!
          </h2>
          <p className="text-lg text-muted-foreground">
            Please try again later.
          </p>

          <Link href="/" className="border-b hover:border-b-foreground">
            Back to home page
          </Link>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
