import { SiteNav } from "@/components/admin/site-nav";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Providers } from "./providers";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <Providers session={session}>
      <div className="dashboard">
        <SiteNav></SiteNav>
        {children}
      </div>
    </Providers>
  );
}
