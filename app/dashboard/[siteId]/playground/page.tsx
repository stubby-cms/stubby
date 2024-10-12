import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlaygroundPage } from "./play-ground-page";
import { getSite } from "../content/actions";

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
      <PlaygroundPage></PlaygroundPage>
    </>
  );
}
