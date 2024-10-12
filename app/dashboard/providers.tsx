"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <SessionProvider session={session}>
      <Toaster className="dark:hidden" />
      <Toaster theme="dark" className="hidden dark:block" />
      {children}
    </SessionProvider>
  );
}
