/* eslint-disable react-hooks/exhaustive-deps */
import { nodeMetadata$, saveStatus$ } from "@/app/dashboard/state";
import { slugify } from "@/lib/utils";
import { observer } from "@legendapp/state/react";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SaveStatus } from "./page-save-satus";

export const PageDbEditorHeader = observer(() => {
  const nodeMetadata = nodeMetadata$.get();
  const siteId = useParams().siteId as string;
  const pageId = useSearchParams().get("id");
  const [localValue, setLocalValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputEl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nodeMetadata?.slug) setLocalValue(nodeMetadata?.slug);
  }, [nodeMetadata]);

  const updateSave = useCallback(async (slug: string) => {
    try {
      saveStatus$.set("saving");

      if (!pageId || !siteId || !slug) return;

      const res = await fetch(`/api/site/${siteId}/nodes/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: slugify(slug) }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error) {
          toast.error(data.error.message);
          setError(data.error.message);
        }
        saveStatus$.set("error");
        return;
      } else {
        saveStatus$.set("saved");
        setLocalValue(slugify(slug));
        nodeMetadata$.slug.set(slugify(slug));
        inputEl.current?.blur();
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="h-[48px] border-b">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center">
          <div className="mr-1 flex h-8 items-center pt-[3px] text-[10px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">
            Slug
          </div>
          <label className="input-sizer ml-2" data-value={localValue}>
            <input
              size={2}
              id="doc-name"
              value={localValue}
              ref={inputEl}
              autoCapitalize="off"
              autoComplete="off"
              onChange={(e) => {
                setError(null);
                setLocalValue(e.target.value);
              }}
              placeholder="Enter slug"
              onBlur={() => {
                if (localValue === "") setLocalValue(nodeMetadata$.slug.peek());
                if (error) {
                  setLocalValue(nodeMetadata$.slug.peek());
                  setError(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateSave(localValue);
                }
                if (e.key === "Escape") {
                  setLocalValue(nodeMetadata$.slug.peek());
                  e.currentTarget.blur();
                }
              }}
            ></input>
          </label>

          <div className="ml-2 text-sm text-red-500">{error}</div>
        </div>
        <div>
          <SaveStatus />
        </div>
      </div>
    </div>
  );
});
