"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getId } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "@legendapp/state/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { mutate } from "swr";
import { z } from "zod";
import { schemaActions, SchemaField, schemaStore$ } from "./state";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";

const formSchema = z.object({
  schemaName: z.string().min(2).max(50),
});

const commonFields: SchemaField[] = [
  {
    id: getId(6),
    key: "title",
    type: "string",
    required: true,
    validations: [
      {
        type: "max",
        value: 65,
      },
      {
        type: "min",
        value: 20,
      },
    ],
  },
  {
    id: getId(6),
    key: "slug",
    type: "string",
    required: true,
    validations: [
      {
        type: "regex",
        value: "^[a-z0-9]+(?:-[a-z0-9]+)*$", // slug regex
      },
    ],
  },
  {
    id: getId(6),
    key: "description",
    type: "string",
    required: true,
    validations: [
      {
        type: "max",
        value: 320,
      },
      {
        type: "min",
        value: 120,
      },
    ],
  },
  {
    id: getId(6),
    key: "keywords",
    type: "array",
    required: true,
    validations: [
      {
        type: "max",
        value: 10,
      },
      {
        type: "min",
        value: 3,
      },
    ],
  },
  {
    id: getId(6),
    key: "author",
    type: "string",
    required: true,
    validations: [],
  },
  {
    id: getId(6),
    key: "publishedAt",
    type: "date",
    required: true,
    validations: [],
  },
  {
    id: getId(6),
    key: "tags",
    type: "array",
    required: true,
    validations: [],
  },
];

export const SchemaNew = observer(
  ({ trigger }: { trigger?: React.ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const siteId = useParams().siteId as string;
    const [open, setOpen] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>(["0", "1"]);
    const schemas = schemaStore$.schemas.get();

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        schemaName: "",
      },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
      setLoading(true);

      const schemaWithSameName = Object.values(schemas).find(
        (schema) => schema.name.trim() === values.schemaName.trim(),
      );

      if (schemaWithSameName) {
        form.setError("schemaName", {
          type: "manual",
          message: "Schema with this name already exists",
        });
        setLoading(false);
        return;
      }

      try {
        const newSchemaObj = {
          id: getId(6),
          name: values.schemaName.trim(),
          fields: selectedFields.map((index) => commonFields[parseInt(index)]),
          siteId: siteId,
          description: "",
        };

        const res = await fetch(`/api/site/${siteId}/schema`, {
          method: "POST",
          body: JSON.stringify(newSchemaObj),
        });

        if (!res.ok) toast.error("Failed to add schema");

        const result = await res.json();

        if (result.success) {
          schemaActions.addSchema(newSchemaObj as any);
          mutate(`/api/site/${siteId}/schema`);
          form.reset();
          schemaActions.currentlyEditingSchemaId(newSchemaObj.id);
        } else {
          toast.error("Failed to add schema");
        }

        setOpen(false);
      } catch (error) {
        toast.error("Failed to add field");
      }

      setLoading(false);
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <button className="rounded-2xl border border-dashed border-border hover:bg-secondary">
              <div className="flex items-center justify-between">
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <PlusIcon size={18} />
                    <span className="font-mono">Add new</span>
                  </div>
                </div>
              </div>
            </button>
          )}
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add new schema</DialogTitle>
                <VisuallyHidden>
                  <DialogDescription>
                    Add a new schema to the site
                  </DialogDescription>
                </VisuallyHidden>
              </DialogHeader>
              <div className="mt-3 space-y-8 py-3">
                <FormField
                  control={form.control}
                  name="schemaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="e.g Blogpost"
                          autoComplete="off"
                          autoCapitalize="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-4"></div>

              <div className="common-fields">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Common fields
                </h3>
                <ToggleGroup
                  type="multiple"
                  className="mt-4 flex flex-wrap gap-4"
                  value={selectedFields}
                  onValueChange={(value) => setSelectedFields(value)}
                >
                  {commonFields.map((field, index) => (
                    <ToggleGroupItem
                      key={field.id}
                      value={index.toString()}
                      className="selection-chip"
                    >
                      <span>{field.key}</span>
                      <span className="icon">
                        <PlusIcon size={16} className="add-icon" />
                        <CheckIcon size={16} className="check-icon" />
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="h-8"></div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" variant={"brand"} loading={loading}>
                  Add
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  },
);
