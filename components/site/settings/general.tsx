import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetcher } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Site } from "@prisma/client";
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

export const GeneralSettings = () => {
  const { mutate } = useSWRConfig();
  const params = useParams();
  const siteId = params.siteId as string;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading } = useSWR<Site>(`/api/site/${siteId}`, fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data as any,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/site/${siteId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        await mutate(`/api/site/${siteId}`);
        toast.success("Site updated successfully");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong");
    }
  }

  if (isLoading || !data) {
    return <div className="px-8">Loading...</div>;
  }

  return (
    <>
      <SiteSettingsPageHeader
        title="General"
        description="In this section you can change general information such as name and
          description of your site."
      />

      <div className="h-6"></div>

      <div className="px-8">
        <div className="rounded-xl border p-4 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="items-center">
                        <FormLabel>Site name</FormLabel>
                        <div className="mt-1 flex flex-1 flex-col space-y-2">
                          <FormControl>
                            <Input
                              placeholder="Name e.g My Site"
                              defaultValue={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-[150px]"></div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g A blog about code and programming."
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <div className="mt-2 pl-1 text-xs opacity-60">
                        A short description helps people understand what your
                        site is about.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex">
                  <Button type="submit" variant={"brand"} loading={loading}>
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};
