import { SetLoginCookie } from "@/components/marketing/login-cookie";
import { CreateSite } from "@/components/site/create-site";
import { SitesList } from "@/components/site/sites-list";
import { Spinner } from "@/components/ui/spinner";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) notFound();

  return (
    <div className="main-chrome">
      <div className="container max-w-screen-lg">
        <div className="flex max-w-screen-xl flex-col p-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <h1 className="font-brand text-3xl">Sites</h1>
              <Suspense fallback={null}>
                <CreateSite />
              </Suspense>
            </div>
            <div className="h-8"></div>
            <Suspense
              fallback={
                <div className="flex h-[400px] w-full items-center justify-center">
                  <Spinner />
                </div>
              }
            >
              <SitesList />
            </Suspense>
          </div>
        </div>
      </div>

      <SetLoginCookie />
    </div>
  );
}
