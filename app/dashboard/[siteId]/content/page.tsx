import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SitePage from "./site-page";
import { getSite } from "./actions";

export default async function ServerSitePage({
  params,
}: {
  params: { siteId: string };
}) {
  const session = await getSession();
  const data = await getSite(params.siteId);

  if (!session || !data || data.userId !== session.user.id) {
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
