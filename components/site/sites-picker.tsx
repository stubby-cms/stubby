"use client";

import { fetcher } from "@/lib/utils";
import { Site } from "@prisma/client";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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
      <div className="flex h-9 w-[120px] items-center justify-center">
        <Spinner size={16} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-9 w-full items-center justify-center">
        Error loading sites
      </div>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-9 min-w-[120px] justify-between rounded-lg px-3 py-1"
          >
            {value
              ? sites?.find((site) => site.id === value)?.name
              : "Select site..."}
            <ChevronsUpDown className="-mr-1 ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
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
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      router.push(`/dashboard/${currentValue}/content`);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === site.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {site.name}
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
