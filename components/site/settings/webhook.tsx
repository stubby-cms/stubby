import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { absoluteUrl, fetcher } from "@/lib/utils";
import { useParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { SiteSettingsPageHeader } from "../site-settings";

const formSchema = z.object({
  id: z.string().optional(),
  url: z.string().url({
    message: "Please enter a valid URL",
  }),
  method: z.enum(["get", "post"]).default("get"),
  type: z.enum(["updated", "created", "deleted"]).default("updated"),
  includeSlug: z.boolean().default(true),
  includeId: z.boolean().default(false),
  includeName: z.boolean().default(false),
  secret: z.string().optional(),
});

const OnPublish = ({
  type = "updated",
}: {
  type?: "updated" | "created" | "deleted";
}) => {
  const params = useParams();
  const siteId = params.siteId as string;
  const [isMutating, setIsMutating] = useState(false);
  const { mutate } = useSWRConfig();

  const { data, isLoading } = useSWR<z.infer<typeof formSchema>>(
    `/api/site/${siteId}/webhook?type=${type}`,
    fetcher,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: data,
    resetOptions: {
      keepDirtyValues: true,
    },
    defaultValues: {
      type: type,
      method: "get",
      includeSlug: true,
      includeId: false,
      includeName: false,
      secret: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsMutating(true);
      const response = await fetch(absoluteUrl(`/api/site/${siteId}/webhook`), {
        method: data?.id ? "PATCH" : "POST",
        body: JSON.stringify({
          siteId: siteId,
          url: values.url,
          method: values.method,
          secret: values.secret || "",
          includeId: values.includeId,
          includeSlug: values.includeSlug,
          includeName: values.includeName,
          id: data?.id,
          type: values.type,
        }),
      });
      const json = await response.json();

      if (json.message == "success") {
        toast.success("Webhook saved");
      } else {
        toast.error("Something went wrong");
      }

      setIsMutating(false);
      mutate(`/api/site/${siteId}/webhook?type=${type}`);
    } catch (error) {
      setIsMutating(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col space-y-8">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="w-[150px]">Webhook URL</FormLabel>
                    <div className="flex flex-1 flex-col space-y-2">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/api/revalidate"
                          defaultValue={field.value}
                          onChange={field.onChange}
                          autoComplete="off"
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
              name="method"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="w-[150px]">Method</FormLabel>
                    <div className="flex flex-1 flex-col space-y-2">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-5"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="get" />
                            </FormControl>
                            <FormLabel className="font-normal">Get</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="post" />
                            </FormControl>
                            <FormLabel className="font-normal">Post</FormLabel>
                          </FormItem>
                        </RadioGroup>
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

            <div className="flex items-center">
              <Label className="w-[150px]">Included data</Label>
              <div className="flex flex-1 space-x-6">
                <FormField
                  control={form.control}
                  name="includeSlug"
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>Slug</span>
                    </label>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeId"
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>Id</span>
                    </label>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeName"
                  render={({ field }) => (
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>Page name</span>
                    </label>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="w-[150px]">
                      Secret (optional)
                    </FormLabel>
                    <div className="flex flex-1 flex-col space-y-2">
                      <FormControl>
                        <Input
                          placeholder="Secret hash, min 36 characters recommended"
                          {...field}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-[150px]"></div>
                    <div className="flex-1">
                      <FormDescription>
                        Used to validate webhook on your server. Make sure the
                        secret is the same as the one you set on your server.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <div className="mt-2">
              <Button type="submit" variant={"brand"} loading={isMutating}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <div className="h-5"></div>
    </>
  );
};

export const WebhookSettings = () => {
  const params = useParams();
  const siteId = params.siteId as string;

  return (
    <>
      <SiteSettingsPageHeader
        title="Webhooks"
        description=" Webhooks are triggered each time you create or publish a page,
          providing a convenient way to revalidate the cache in frameworks like
          Next, Nuxt, or similar."
      />

      <div className="h-6"></div>

      <div className="px-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-2">
              On page published
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <OnPublish key="update" type="updated" />
              <div className="h-5"></div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="px-2">
              On page created or deleted
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <OnPublish key="create" type="created" />
              <div className="h-5"></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};
