import { getSite } from "@/db/sites";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SchemaPage } from "./schema-page";

export default async function ServerSchemaPage({
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
    <div className="w-full">
      <SchemaPage></SchemaPage>
    </div>
  );
}
