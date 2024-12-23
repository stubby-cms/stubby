import { observable } from "@legendapp/state";
import { type Prisma } from "@prisma/client";

export const saveStatus$ = observable<"saved" | "saving" | "unsaved" | "error">(
  "saved",
);

export const lastSaved$ = observable<number>(1);

export const draft$ = observable<string>("");

export const content$ = observable<string>("");

export const nodeMetadata$ = observable<{
  id: string;
  slug: string;
  title: string;
  name: string;
  publishedAt: Date | null;
}>();

export const publishedAt$ = observable<number | boolean>();

export const hasUnPublishedChanges$ = observable(() => {
  return draft$.get() !== content$.get();
});

export const dbContent$ = observable<Prisma.JsonArray | null>(null);
export const dbCols$ = observable<Prisma.JsonArray | null>([]);

export const nodeMutationStatus$ = observable<
  "creating" | "updating" | "deleting" | false
>(false);

export const isCommandPaletteOpen$ = observable<boolean>(false);

export const showNewColumnModal$ = observable<boolean>(false);
