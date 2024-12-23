import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getSite } from "@/db/sites";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SitePage from "./site-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content editor - Stubby CMS",
  description: "Edit your site's content with Stubby CMS.",
};

export default async function ServerSitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const siteId = (await params).siteId;

  const session = await getSession();
  const data = await getSite(siteId);

  if (!session || !data || data.ownerId !== session.user.id) {
    redirect("/login");
  }

  return (
    <>
      <SitePage></SitePage>
      <div className="fixed bottom-6 right-6">
        <ThemeToggle />
      </div>
    </>
  );
}
