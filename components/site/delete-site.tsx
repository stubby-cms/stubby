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
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as z from "zod";

const formSchema = z.object({
  confirmation: z.string().regex(/delete my site/, {
    message: "Please type 'delete my site' to confirm.",
  }),
});

export const DeleteSite = ({ onDeleted }: { onDeleted: () => void }) => {
  const [open, setOpen] = useState(false);
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const siteId = params.siteId as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.confirmation !== "delete my site") {
      toast.error("Please type 'delete my site' to confirm.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/site/${siteId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.message == "failure") {
        toast.error(json.data);
        setLoading(true);
        return;
      } else {
        toast.success(`Successfully deleted site!`);
        mutate(`/api/site`);
        setOpen(false);
        onDeleted();
      }
    } catch (err) {
      toast.error("Something went wrong.");
      setLoading(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"destructive"} className="px-4">
          Delete site
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Delete Site</DialogTitle>
            </DialogHeader>
            <div className="mt-3 py-3">
              <p className="text-sm">
                This action is irreversible. Please type <b>delete my site</b>{" "}
                to confirm.
              </p>
              <div className="h-2"></div>
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="delete my site"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
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
              <Button type="submit" variant={"destructive"} loading={loading}>
                Delete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
