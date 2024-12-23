import { getSite } from "@/db/sites";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlaygroundPage } from "./play-ground-page";

export default async function ServerSitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const session = await getSession();
  const data = await getSite(siteId);

  if (!session || !data || data.ownerId !== session.user.id) {
    redirect("/login");
  }

  return (
    <>
      <PlaygroundPage></PlaygroundPage>
    </>
  );
}
