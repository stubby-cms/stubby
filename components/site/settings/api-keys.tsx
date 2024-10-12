import { CopyButton } from "@/components/common/copy-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { absoluteUrl, fetcher } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Site } from "@prisma/client";
import { RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { z } from "zod";
import { SiteSettingsPageHeader } from "../site-settings";

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const ApiKeysSettings = () => {
  const { mutate } = useSWRConfig();
  const params = useParams();
  const siteId = params.siteId as string;
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading } = useSWR<Site>(`/api/site/${siteId}`, fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data as any,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const refreshApiKey = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        absoluteUrl(`/api/site/${siteId}/refresh-api-key`),
        {
          method: "POST",
        },
      );

      if (res.ok) {
        await mutate(`/api/site/${siteId}`);
        setRefreshing(false);
        toast.success(
          "New key generated, make sure you update it everywhere you use it",
        );
      }
    } catch (error) {
      setRefreshing(false);
      toast.error("Something went wrong");
    }
  };

  if (isLoading || !data) {
    return <div className="px-8">Loading...</div>;
  }

  return (
    <>
      <SiteSettingsPageHeader
        title="API Keys"
        description="Manage your site API keys"
      />

      <div className="h-6"></div>

      <div className="px-8">
        <div className="flex flex-col space-y-6 rounded-xl border p-4 shadow-sm">
          <div className="flex items-center">
            <Label className="w-[150px]">Site id</Label>
            <div className="rounded-md border bg-slate-100/5 px-2 py-1 font-mono text-sm">
              {data?.id}
            </div>{" "}
            <CopyButton value={data?.id} className="ml-2" />
          </div>

          <div className="flex items-center">
            <Label className="w-[150px]">API key</Label>
            <div className="flex flex-1 items-center">
              <div className="flex flex-1 items-center">
                <div className="rounded-md border bg-slate-100/5 px-2 py-1 font-mono text-sm">
                  {data?.apiKey}
                </div>{" "}
                <CopyButton value={data?.apiKey || ""} className="ml-2" />
              </div>
              <div>
                <Button variant={"link"} size={"sm"} onClick={refreshApiKey}>
                  {refreshing ? (
                    <Spinner size={16} className="mr-2" />
                  ) : (
                    <RefreshCcw className="mr-2 h-4 w-4" />
                  )}
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
