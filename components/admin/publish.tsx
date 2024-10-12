"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { DiffViewer } from "./diff-viewer";
import { content$, draft$, lastSaved$ } from "@/app/dashboard/state";

export const PublishDialog = () => {
  const [open, setOpen] = useState(false);

  const disabled = draft$.get() === content$.get();
  const version = lastSaved$.get().toString();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div
                className={clsx(
                  "segment-button shadow-sm) flex h-9 items-center rounded-full border border-[#0000000d] bg-brand text-brand-foreground",
                  {
                    "cursor-not-allowed opacity-50": disabled,
                  },
                )}
              >
                <button
                  className="h-9 rounded-l-full pl-3.5 pr-2 text-[14px] font-medium hover:bg-brand1"
                  disabled={disabled}
                >
                  Publish
                </button>
                <button
                  className="h-9 rounded-r-full border-l border-l-gray-700/25 pl-1.5 pr-2 hover:bg-brand1"
                  disabled={disabled}
                >
                  <ChevronDown className="text-gray-900/65" size={18} />
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {disabled ? "No changes to publish" : "Publish changes"}
            </TooltipContent>
          </Tooltip>
        </div>
      </DialogTrigger>
      <DialogContent
        hideClose={true}
        style={{
          maxWidth: "calc(80vw - 64px)",
          height: "90vh",
        }}
        className="overflow-hidden p-0"
      >
        <DiffViewer setOpen={setOpen} version={version} />
      </DialogContent>
    </Dialog>
  );
};
