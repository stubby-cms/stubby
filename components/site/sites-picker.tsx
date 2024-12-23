"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, fetcher } from "@/lib/utils";
import { Site } from "@prisma/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";

export function SitePicker() {
  const {
    data: sites,
    error,
    isLoading,
  } = useSWR<Site[]>("/api/site", fetcher);

  const router = useRouter();
  const params = useParams();

  const siteId = params.siteId as string;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(siteId);

  if (isLoading) {
    return (
      <div className="flex h-8 w-[120px] items-center justify-center">
        <Spinner size={16} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-8 w-full items-center justify-center">
        Error loading sites
      </div>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-owns="site-listbox"
            aria-controls="site-listbox"
            className="relative flex h-8 max-w-[100%] flex-1 items-center justify-between rounded-lg border-none bg-transparent px-2 text-sm font-medium hover:bg-secondary"
          >
            <div className="truncate">
              {value
                ? sites?.find((site) => site.id === value)?.name
                : "Select site..."}
            </div>
            <ChevronsUpDown className="-mr-1 ml-2 h-4 w-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search sites..." />
            <CommandList>
              <CommandEmpty>No sites found.</CommandEmpty>
              <CommandGroup>
                {sites?.map((site) => (
                  <CommandItem
                    key={site.id}
                    value={site.id}
                    onSelect={(currentValue) => {
                      if (currentValue === value) {
                        setOpen(false);
                        return;
                      }
                      setValue(currentValue);
                      router.push(`/dashboard/${currentValue}/content`);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === site.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="truncate">{site.name}</div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
