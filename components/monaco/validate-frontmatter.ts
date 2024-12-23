import { SchemaField } from "@/app/dashboard/[siteId]/schema/state";
import { parseFrontMatter } from "@/lib/frontmatter";
import { Schema } from "@prisma/client";
import { z } from "zod";

const generateZodSchema = (fields: SchemaField[]) => {
  const schemaShape: Record<string, any> = {};

  fields.forEach((field) => {
    let zodType: any;

    // Determine base type
    switch (field.type) {
      case "string":
        zodType = z.string();
        break;
      case "number":
        zodType = z.number();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "date":
        zodType = z.date();
        break;
      case "array":
        zodType = z.array(z.any()); // Default to any; customize based on requirements
        break;
      case "object":
        zodType = z.object({});
        break;
      default:
        throw new Error(`Unsupported type: ${field.type}`);
    }

    // Apply validations
    if (field.validations) {
      field.validations.forEach((validation: { type: string; value: any }) => {
        const { type, value } = validation;
        if (value) {
          if (type == "regex") {
            zodType = zodType.regex(
              new RegExp(value),
              `Invalid value for ${field.key}, must match regular expression ${value}`,
            );
          } else {
            zodType = zodType[type](value);
          }
        } else {
          zodType = zodType[type]();
        }
      });
    }

    // Apply required or optional
    schemaShape[field.key] = field.required ? zodType : zodType.optional();
  });

  return z.object(schemaShape);
};

const schemaCache = new WeakMap();
const getMemoizedZodSchema = (schemaFields: SchemaField[]) => {
  if (!schemaCache.has(schemaFields)) {
    schemaCache.set(schemaFields, generateZodSchema(schemaFields));
  }
  return schemaCache.get(schemaFields);
};

export const validateFrontmatter = async (
  frontMatterRaw: string,
  schema: Schema,
) => {
  const data = parseFrontMatter(frontMatterRaw);
  if (!data) return [];

  if (data && schema && schema?.fields) {
    const zodSchema = getMemoizedZodSchema(schema.fields) as z.ZodObject<any>;
    try {
      zodSchema.parse(data);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return error.issues;
      }

      return [];
    }
  }

  return [];
};
