"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  siteName: z
    .string()
    .min(2, {
      message: "At least 2 characters required",
    })
    .max(50, {
      message: "At most 50 characters allowed",
    }),
  description: z.optional(z.string().max(200)),
});

export const CreateSite = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteName: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const res = await fetch("/api/site", {
        method: "POST",
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (data.message == "failure") {
        toast.error(data.data);
        setLoading(false);
        return;
      } else {
        const { id } = data.data;
        if (id) {
          toast.success(`Successfully created site!`);
          router.push(`/dashboard/${id}/content`);
          setOpen(false);
        }
      }
    } catch (err) {
      toast.error(`Failed to create site!`);
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"brand"}>Create new site</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create new site</DialogTitle>
            </DialogHeader>
            <div className="mt-3 space-y-8 py-3">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g Code Chronicles"
                        {...field}
                        autoComplete="off"
                        autoCapitalize="off"
                      />
                    </FormControl>
                    <FormMessage />
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
                      A short description helps people understand what your site
                      is about.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="h-4"></div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant={"brand"} loading={loading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
