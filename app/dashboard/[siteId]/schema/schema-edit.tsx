/* eslint-disable react-hooks/exhaustive-deps */

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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getId } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "@legendapp/state/react";
import { Schema } from "@prisma/client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { camelCase, clone, isArray } from "lodash";
import {
  ArrowLeft,
  ArrowLeftIcon,
  Delete,
  EditIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  schemaActions,
  SchemaField,
  SchemaFieldTypes,
  SchemaFieldTypeZ,
  schemaStore$,
} from "./state";
import clsx from "clsx";

export const validationOptions: Record<string, string[]> = {
  string: [
    "min",
    "max",
    "length",
    "email",
    "url",
    "uuid",
    "cuid",
    "regex",
    "startsWith",
    "endsWith",
  ],
  number: [
    "min",
    "max",
    "int",
    "positive",
    "negative",
    "multipleOf",
    "finite",
    "safe",
  ],
  boolean: [],
  date: ["min", "max"],
  array: ["min", "max", "length", "nonempty"],
  object: ["strict", "strip"],
};

const hasValue = ["min", "max", "length", "regex", "startsWith", "endsWith"];

const formSchema = z.object({
  fieldKey: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, {
      message: "Key must only container letters and numbers",
    }),
  fieldType: SchemaFieldTypeZ,
  fieldValidations: z.array(
    z.object({
      type: z.string(),
      value: z.string(),
    }),
  ),
  fieldRequired: z.boolean(),
  fieldId: z.string().length(6),
});

const SchemaFieldsList = observer(() => {
  const schemas = schemaStore$.schemas.get();
  const schemaId = schemaStore$.currentlyEditingSchemaId.get();
  const schema = schemas[schemaId];
  const siteId = useParams().siteId as string;

  const deleteField = (schemaId: string, fieldId: string) => async () => {
    const fields = schema.fields?.filter((field) => field.id !== fieldId);
    const newSchema = { ...schema, fields } as Schema;

    await fetch(`/api/site/${siteId}/schema/${schemaId}`, {
      method: "PATCH",
      body: JSON.stringify(newSchema),
    });

    schemaActions.updateSchema(newSchema);
  };

  return (
    <table className="w-full border-collapse border-none">
      <tbody className="w-full">
        {schema?.fields?.map((field) => {
          return (
            <tr key={field.id} className="text-sm">
              <td></td>
              <td className="border-y px-3 py-3 font-mono">{field.key}</td>
              <td className="border-y font-mono">
                <span
                  className={clsx(
                    "inline-block rounded-md border px-1.5 py-1 leading-none",
                    {
                      "border-green-200 bg-green-50 text-green-700":
                        field.type === "string",
                      "border-orange-200 bg-orange-50 text-orange-700":
                        field.type === "number",
                      "border-blue-200 bg-blue-50 text-blue-700":
                        field.type === "boolean",
                      "border-indigo-200 bg-indigo-50 text-indigo-700":
                        field.type === "array",
                      "border-red-200 bg-red-50 text-red-800":
                        field.type === "object",
                      "border-purple-200 bg-purple-50 text-purple-700":
                        field.type === "date",
                    },
                  )}
                >
                  {field.type}
                </span>
              </td>
              <td className="border-y font-mono text-sm">
                {field.required ? "required" : "optional"}
              </td>
              <td className="border-y">
                <div className="flex flex-wrap gap-1">
                  {field.validations &&
                    isArray(field.validations) &&
                    field.validations?.map((validation: any) => {
                      return (
                        <div
                          key={validation.type}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-mono text-sm dark:bg-slate-800"
                        >
                          {validation.type} {validation.value}
                        </div>
                      );
                    })}
                </div>
              </td>
              <td className="border-y">
                <div className="mr-4 flex justify-end gap-4">
                  <SchemaFieldDialog
                    trigger={
                      <button className="flex items-center justify-center">
                        <EditIcon size={16} />
                      </button>
                    }
                    field={field}
                  />

                  <button onClick={deleteField(schemaId, field.id)}>
                    <Trash2Icon size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

const SchemaFieldDialog = observer(
  ({ trigger, field }: { trigger: React.ReactNode; field?: SchemaField }) => {
    const schemaId = schemaStore$.currentlyEditingSchemaId.get();
    const [loading, setLoading] = useState(false);
    const [fieldType, setFieldType] = useState<string>("string");
    const [validationType, setValidationType] = useState<string>("min");
    const [validationValue, setValidationValue] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [required, setRequired] = useState(true);
    const siteId = useParams().siteId as string;

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        fieldKey: field?.key ?? "",
        fieldType: field?.type ?? "string",
        fieldValidations: (field?.validations as any) ?? [],
        fieldRequired: field?.required ?? true,
        fieldId: field?.id ?? getId(6),
      },
    });

    useEffect(() => {
      if (field) {
        setFieldType(field.type);
        setRequired(field.required ?? true);
        form.setValue("fieldType", field.type);
        form.setValue("fieldRequired", field.required ?? true);
        form.setValue("fieldValidations", (field.validations as any) ?? []);
        form.setValue("fieldKey", field.key);
        form.setValue("fieldId", field.id);
      }
    }, [field]);

    const saveSchemaOnServer = async (
      siteId: string,
      schemaId: string,
      schema: Schema,
    ) => {
      await fetch(`/api/site/${siteId}/schema/${schemaId}`, {
        method: "PATCH",
        body: JSON.stringify(schema),
      });
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
      setLoading(true);
      let updatedSchema = null;

      if (field) {
        const fields = schemaStore$.schemas[schemaId].fields;
        const updatedFields = fields.peek().map((f) => {
          if (f.id === field.id) {
            return {
              ...f,
              key: values.fieldKey,
              type: values.fieldType,
              required: values.fieldRequired,
              validations: values.fieldValidations,
            };
          }

          return f;
        });

        updatedSchema = {
          ...schemaStore$.schemas[schemaId].peek(),
          fields: updatedFields,
        };
      } else {
        // Check if the field key already exists
        const existingField = schemaStore$.schemas[schemaId].fields
          .peek()
          .find((f) => f.key === values.fieldKey);

        if (existingField) {
          form.setError("fieldKey", {
            type: "manual",
            message: "Field with this key already exists",
          });
          setLoading(false);
          return;
        }

        const newField = {
          id: getId(6),
          key: camelCase(values.fieldKey),
          type: values.fieldType,
          required: required,
          validations: values.fieldValidations,
        };

        const fields = schemaStore$.schemas[schemaId].fields;
        updatedSchema = {
          ...schemaStore$.schemas[schemaId].peek(),
          fields: [...fields.peek(), newField],
        };
      }

      if (updatedSchema) {
        await saveSchemaOnServer(siteId, schemaId, updatedSchema);
        schemaActions.updateSchema(updatedSchema);
      }

      setLoading(false);
      form.reset();
      setDialogOpen(false);
    }

    const addValidation = () => {
      const validationShouldHaveValue = hasValue.includes(validationType);

      if (validationShouldHaveValue && !validationValue) {
        toast.error("Validation value is required");
        return;
      }

      const val = hasValue.includes(validationType) ? validationValue : "";

      const validations = clone(form.getValues("fieldValidations"));
      const existingValidation = validations.find((v) => {
        return v.type === validationType;
      });

      if (existingValidation) {
        existingValidation.value = val ?? "";
        form.setValue("fieldValidations", validations);
      } else {
        form.setValue("fieldValidations", [
          ...form.getValues("fieldValidations"),
          { type: validationType, value: val ?? "" },
        ]);
      }

      setValidationValue(null);
      setPopoverOpen(false);
    };

    return (
      <div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add new field</DialogTitle>
                  <VisuallyHidden>
                    <DialogDescription>
                      Add a new field to the schema.
                    </DialogDescription>
                  </VisuallyHidden>
                </DialogHeader>
                <div className="mt-3 flex gap-4 py-3">
                  <FormField
                    control={form.control}
                    name="fieldKey"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="font-mono">Key</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g title"
                            autoComplete="off"
                            autoCapitalize="off"
                            className="font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="font-mono">Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setFieldType(value);
                              setValidationType(
                                validationOptions[value][0] as string,
                              );

                              form.setValue("fieldValidations", []);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="font-mono">
                              {field.value}
                            </SelectTrigger>
                            <SelectContent>
                              {SchemaFieldTypes.map((type) => {
                                return (
                                  <SelectItem
                                    key={type}
                                    value={type}
                                    className="font-mono"
                                  >
                                    {type}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="-mr-2 flex items-center justify-end gap-2">
                  <Label className="font-mono">Optional?</Label>
                  <Switch
                    className="scale-[0.6]"
                    onCheckedChange={(checked) => {
                      setRequired(!checked);
                      form.setValue("fieldRequired", !checked);
                    }}
                    checked={!required}
                  />
                </div>

                <div className="h-3"></div>

                <div className="flex flex-wrap gap-2">
                  {isArray(form.watch("fieldValidations")) &&
                    form.watch("fieldValidations").map((validation, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 font-mono text-sm dark:bg-slate-800"
                        >
                          <span className="font-mono">{validation.type}</span>
                          {validation.value && (
                            <>
                              <span className="font-mono">
                                {validation.value}
                              </span>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              form.setValue(
                                "fieldValidations",
                                form
                                  .getValues("fieldValidations")
                                  .filter((_, i) => {
                                    return i !== index;
                                  }),
                              );
                            }}
                            className="ml-1 flex rounded-full p-1 hover:bg-background"
                          >
                            <XIcon size={12} />
                          </button>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-3">
                  {fieldType == "boolean" || fieldType == "object" ? (
                    <></>
                  ) : (
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger className="flex items-center gap-1 rounded-full border border-dashed border-gray-300 py-1 pl-2 pr-3 font-mono text-sm text-muted-foreground hover:bg-secondary dark:border-gray-700">
                        <PlusIcon size={16} />
                        Add validation
                      </PopoverTrigger>
                      <PopoverContent className="w-[480px]">
                        <FormField
                          control={form.control}
                          name="fieldValidations"
                          render={({ field }) => (
                            <div className="p-2">
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <Select
                                    onValueChange={(value) => {
                                      setValidationType(value);

                                      // field.onChange([
                                      //   ...field.value,
                                      //   { type: value, value: "" },
                                      // ]);
                                    }}
                                    value={validationType}
                                  >
                                    <SelectTrigger className="font-mono">
                                      {validationType
                                        ? validationType
                                        : "Select"}
                                    </SelectTrigger>
                                    <SelectContent>
                                      {validationOptions[fieldType].map(
                                        (option) => {
                                          return (
                                            <SelectItem
                                              key={option}
                                              value={option}
                                              className="font-mono"
                                            >
                                              {option}
                                            </SelectItem>
                                          );
                                        },
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {hasValue.includes(validationType) && (
                                  <div className="flex-1">
                                    <Input
                                      placeholder="Value"
                                      autoComplete="off"
                                      autoCapitalize="off"
                                      className="font-mono"
                                      onChange={(e) => {
                                        setValidationValue(e.target.value);
                                      }}
                                    />
                                  </div>
                                )}

                                <div>
                                  <Button
                                    variant={"default"}
                                    size={"sm"}
                                    className="rounded-xl font-mono"
                                    onClick={() => {
                                      addValidation();
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <div className="h-4"></div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" variant={"brand"} loading={loading}>
                    {field ? "Update" : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

const DeleteSchemaDialog = observer(() => {
  const schemaId = schemaStore$.currentlyEditingSchemaId.get();
  const siteId = useParams().siteId as string;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteSchema = async () => {
    setLoading(true);
    await fetch(`/api/site/${siteId}/schema/${schemaId}`, {
      method: "DELETE",
    });

    schemaActions.deleteSchema(schemaId);
    schemaActions.currentlyEditingSchemaId(null);
    setLoading(false);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={"link"} size={"sm"} className="text-red-500">
          Delete schema
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete schema</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Are you sure you want to delete this schema?
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        Are you sure you want to delete this schema?
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            variant={"destructive"}
            onClick={deleteSchema}
            loading={loading}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const SchemaEditPage = () => {
  return (
    <>
      <SchemaFieldsList />
      <SchemaFieldDialog
        trigger={
          <button
            className="flex h-10 items-center gap-2 border-b pl-3 font-mono text-sm hover:bg-secondary"
            style={{ width: `calc(100% - 4px)`, marginLeft: 4 }}
          >
            <PlusIcon size={16} />
            Add new field
          </button>
        }
      />
      <div className="-mb-8 mt-8 flex justify-between">
        <div className="flex">
          <Button
            variant={"link"}
            size={"sm"}
            onClick={() => {
              schemaActions.currentlyEditingSchemaId(null);
            }}
          >
            Back
          </Button>
        </div>
        <DeleteSchemaDialog />
      </div>
    </>
  );
};
