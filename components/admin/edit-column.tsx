import { dbContent$ } from "@/app/dashboard/state";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "@legendapp/state/react";
import { camelCase, cloneDeep } from "lodash";
import {
  AtSignIcon,
  BracesIcon,
  CalendarClockIcon,
  HashIcon,
  ImageIcon,
  LinkIcon,
  ScrollTextIcon,
  ToggleLeftIcon,
  TypeIcon,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as z from "zod";

const formSchema = z.object({
  columnTitle: z
    .string()
    .min(2, {
      message: "At least 2 characters required",
    })
    .max(50, {
      message: "At most 50 characters allowed",
    }),
  columnId: z
    .string()
    .min(1, {
      message: "At least 1 characters required",
    })
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, {
      message: "ID must only container letters",
    }),
  columnType: z.enum([
    "text",
    "number",
    "date",
    "boolean",
    "json",
    "image",
    "richText",
    "url",
    "email",
  ]),
});

const fieldTypes = [
  {
    type: "text",
    label: "Text",
    icon: TypeIcon,
  },
  {
    type: "number",
    label: "Number",
    icon: HashIcon,
  },
  {
    type: "date",
    label: "Date",
    icon: CalendarClockIcon,
  },
  {
    type: "boolean",
    label: "Boolean",
    icon: ToggleLeftIcon,
  },
  {
    type: "json",
    label: "JSON",
    icon: BracesIcon,
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
  },
  {
    type: "richText",
    label: "Rich text",
    icon: ScrollTextIcon,
  },
  {
    type: "url",
    label: "URL",
    icon: LinkIcon,
  },
  {
    type: "email",
    label: "Email",
    icon: AtSignIcon,
  },
];

export const EditColumnForm = observer(
  ({
    cols,
    currentColIndex,
    setDialogOpen,
    save,
  }: {
    cols: any;
    currentColIndex: number;
    setDialogOpen: (value: boolean) => void;
    save: (newData: any) => void;
  }) => {
    const [loading, setLoading] = useState(false);
    const siteId = useParams().siteId;
    const pageId = useSearchParams().get("id");
    const { mutate } = useSWRConfig();

    const currentCol = cols[currentColIndex];
    const dbContent: any = cloneDeep(dbContent$.peek());

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        columnTitle: currentCol.title,
        columnId: currentCol.id,
        columnType: currentCol.type,
      },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
      try {
        setLoading(true);
        const newCols = cloneDeep(cols);

        newCols[currentColIndex] = {
          title: values.columnTitle,
          type: values.columnType,
          width: currentCol.width,
          id: values.columnId,
          hasMenu: true,
        };

        const columnTitles = new Set(newCols.map((e: any) => e.title));

        if (columnTitles.size !== newCols.length) {
          form.setError("columnTitle", {
            message: "Name must be unique",
          });

          setLoading(false);
          return;
        }

        const columnIds = new Set(newCols.map((e: any) => e.id));
        if (columnIds.size !== newCols.length) {
          form.setError("columnId", {
            message: "Id must be unique",
          });

          setLoading(false);
          return;
        }

        if (values.columnId !== currentCol.id) {
          const newData = cloneDeep(dbContent);

          for (let i = 0; i < newData.length; i++) {
            newData[i][values.columnId] = newData[i][currentCol.id];
            delete newData[i][currentCol.id];
          }

          dbContent$.set(newData);
          save(newData);
        }

        const res = await fetch(`/api/site/${siteId}/nodes/${pageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dbCols: newCols }),
        });

        if (res.ok && res.status < 300) {
          toast.success(`Column updated!`);
          mutate(`/api/site/${siteId}/nodes/${pageId}`);
        } else {
          toast.error(`Failed to edit column!`);
        }

        setDialogOpen(false);
        setLoading(false);
      } catch (err) {
        toast.error(`Failed to edit column!`);
        setLoading(false);
      }
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="columnTitle"
              render={({ field }) => (
                <FormItem className="flex items-start">
                  <FormLabel className="flex h-14 min-w-[70px] items-center text-muted-foreground">
                    Name
                  </FormLabel>
                  <div className="flex flex-1 flex-col gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g. Title"
                        autoComplete="off"
                        autoCapitalize="off"
                        defaultValue={field.value}
                        onChange={(e) => {
                          form.setValue("columnId", camelCase(e.target.value), {
                            shouldDirty: true,
                          });
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="columnId"
              render={({ field }) => (
                <FormItem className="flex items-start">
                  <FormLabel className="flex h-14 min-w-[70px] items-center text-muted-foreground">
                    ID
                  </FormLabel>
                  <div className="flex flex-1 flex-col gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. title"
                        autoComplete="off"
                        autoCapitalize="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="columnType"
              render={({ field }) => (
                <FormItem className="flex items-start">
                  <FormLabel className="flex h-14 min-w-[70px] items-center text-muted-foreground">
                    Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldTypes.map((fieldType) => (
                        <SelectItem key={fieldType.type} value={fieldType.type}>
                          <div className="flex items-center gap-2">
                            <fieldType.icon
                              size={16}
                              className="text-muted-foreground"
                            ></fieldType.icon>
                            {fieldType.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <div className="h-5"></div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant={"brand"} loading={loading}>
              Save
            </Button>
          </div>
        </form>
      </Form>
    );
  },
);
