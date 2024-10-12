import { observable } from "@legendapp/state";
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";

enableReactTracking({ auto: true });

export const saveStatus$ = observable<"saved" | "saving" | "unsaved" | "error">(
  "saved",
);

export const lastSaved$ = observable<number>(1);

export const draft$ = observable<string>("");

export const content$ = observable<string>("");

export const publishedAt$ = observable<number | boolean>();

export const nodeMutationStatus$ = observable<
  "creating" | "updating" | "deleting" | false
>(false);
