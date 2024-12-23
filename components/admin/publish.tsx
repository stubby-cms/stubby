"use client";

import { content$, draft$, lastSaved$ } from "@/app/dashboard/state";
import { observer } from "@legendapp/state/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DiffViewer } from "./diff-viewer";

const PublishButton = observer(() => {
  const isDisabled = draft$.get() === content$.get();

  return (
    <DialogTrigger asChild>
      <button
        className={clsx(
          "flex h-8 items-center rounded-full border border-[#0000000d] bg-brand px-3.5 text-[14px] font-medium text-brand-foreground shadow-sm",
          {
            "cursor-not-allowed opacity-50": isDisabled,
          },
        )}
        disabled={isDisabled}
      >
        Publish
      </button>
    </DialogTrigger>
  );
});

const ObservedDiffView = observer(
  ({ setOpen }: { setOpen: (open: boolean) => void }) => {
    const version = lastSaved$.get().toString();
    return <DiffViewer setOpen={setOpen} version={version} />;
  },
);

export const PublishDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <PublishButton />
      <DialogContent
        hideClose={true}
        style={{
          maxWidth: "calc(80vw - 64px)",
          height: "90vh",
        }}
        className="overflow-hidden p-0"
      >
        <VisuallyHidden>
          <DialogTitle>Review your changes</DialogTitle>
          <DialogDescription>
            Compare the changes you made to the last saved version
          </DialogDescription>
        </VisuallyHidden>
        <ObservedDiffView setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
