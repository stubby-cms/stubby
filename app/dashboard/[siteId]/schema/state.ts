import { observable } from "@legendapp/state";
import { type Schema } from "@prisma/client";
import { z } from "zod";

export const SchemaFieldTypes: [string, ...string[]] = [
  "string",
  "number",
  "boolean",
  "array",
  "object",
  "date",
];

export const SchemaFieldTypeZ = z.enum(SchemaFieldTypes);
export type SchemaFieldType = z.infer<typeof SchemaFieldTypeZ>;

export interface SchemaField {
  id: string;
  key: string;
  type: SchemaFieldType;
  required?: boolean;
  validations?: Record<string, any>;
}

interface SchemaStore {
  schemas: Record<string, Schema>;
  currentlyEditingSchemaId: string | null;
}

export const schemaStore$ = observable<SchemaStore>({
  schemas: {},
  currentlyEditingSchemaId: null,
});

// Actions
export const schemaActions = {
  populateFromServer(schemas: Array<Schema>) {
    const normalizedSchemas: Record<string, Schema> = {};

    schemas.forEach((schema) => {
      normalizedSchemas[schema.id] = {
        ...schema,
        fields: schema.fields || [],
      };
    });

    schemaStore$.schemas.set(normalizedSchemas);
  },
  addSchema(schema: Schema) {
    schemaStore$.schemas[schema.id].set({
      ...schema,
      fields: schema.fields || [],
    });
  },
  updateSchema(schema: Schema) {
    schemaStore$.schemas[schema.id].set({
      ...schema,
      fields: schema.fields || [],
    });
  },
  deleteSchema(schemaId: string) {
    schemaStore$.schemas[schemaId].delete();
  },
  addField(schemaId: string, field: SchemaField) {
    const fields = schemaStore$.schemas[schemaId].fields;
    fields.set([...fields.peek(), field]);
  },
  updateField(schemaId: string, field: SchemaField) {
    const fields = schemaStore$.schemas[schemaId].fields;
    fields.set(fields.peek().map((f) => (f.id === field.id ? field : f)));
  },
  deleteField(schemaId: string, fieldId: string) {
    const fields = schemaStore$.schemas[schemaId].fields;
    fields.set(fields.peek().filter((f) => f.id !== fieldId));
  },
  currentlyEditingSchemaId(schemaId: string | null) {
    schemaStore$.currentlyEditingSchemaId.set(schemaId);
  },
};
