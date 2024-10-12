/* eslint-disable @next/next/no-img-element */
import { LogoFull } from "@/components/common/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./form";

export default function LoginPage() {
  return (
    <>
      <div className="mx-auto min-w-[400px] max-w-lg rounded-2xl border p-10">
        <div className="flex items-center justify-center">
          <LogoFull size={28} className="mx-auto" />
        </div>

        <div className="mt-6 text-center text-muted-foreground">
          Sign in to your account
        </div>

        <div className="mx-auto mt-10 flex w-11/12 max-w-xs flex-col gap-4 sm:w-full">
          <LoginForm />
        </div>

        <div className="fixed bottom-6 right-6">
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-6 text-center text-muted-foreground">
        <Link
          href={`${process.env.NEXT_PUBLIC_HOST}`}
          className="mt-6 text-center text-sm text-foreground"
        >
          &lt;- Go back home
        </Link>
      </div>
    </>
  );
}
