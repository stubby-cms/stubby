import { SchemaField } from "@/app/dashboard/[siteId]/schema/state";

declare global {
  namespace PrismaJson {
    type FieldsType = SchemaField[] | null;
  }
}
