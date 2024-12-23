"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { groupBy } from "lodash";
import { Shapes } from "lucide-react";
import { nanoid } from "nanoid";
import { useMemo, useState } from "react";

type Item = {
  id: string;
  name: string;
  slug: string;
  isFolder: boolean;
  parentId: string | null;
  type: string;
  path?: string;
};

function addPathToItems(items: Item[]): Item[] {
  // Create a dictionary for quick lookup of items by id
  const itemDict: { [key: string]: Item } = {};
  items.forEach((item) => {
    itemDict[item.id] = item;
  });

  // Add "path" attribute to each item
  items.forEach((item) => {
    const path: string[] = [];
    let current: Item | undefined = item.parentId
      ? itemDict[item.parentId]
      : undefined;

    // Traverse to the root to create the path
    while (current) {
      path.unshift(current.name);
      current = current.parentId ? itemDict[current.parentId] : undefined;
    }

    // Add the current item name if it is a folder
    if (item.isFolder) {
      path.push(item.name);
    }

    // Join path names with "/"
    item.path = path.join("/");
  });

  const group = groupBy(items, "path");
  const sortedKeys = Object.keys(group).sort();

  const finalItems: any = [];

  sortedKeys.forEach((key) => {
    if (key == "") return;
    finalItems.push({
      type: "folder",
      name: key,
      id: nanoid(10),
    });

    group[key].forEach((item) => {
      if (!item.isFolder) finalItems.push(item);
    });
  });

  group[""]?.forEach((item) => {
    if (!item.isFolder) finalItems.push(item);
  });

  return finalItems;
}

export const PageFinder = ({
  nodes,
  onSelect,
}: {
  nodes: any;
  onSelect: (item: Item) => void;
}) => {
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    if (!nodes) return null;
    return addPathToItems(nodes);
  }, [nodes]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center gap-2 rounded-md outline-none hover:bg-slate-200 dark:hover:bg-slate-800">
          <Shapes size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="h-[340px] w-[280px] overflow-y-auto"
        align="start"
      >
        {list &&
          list.map((item: any) => {
            if (item.type == "folder") {
              return (
                <DropdownMenuLabel
                  key={item.id}
                  className="text-sm text-muted-foreground"
                >
                  {item.name}
                </DropdownMenuLabel>
              );
            }

            return (
              <DropdownMenuItem
                key={item.id}
                className="cursor-pointer"
                onSelect={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <div className={item.parentId ? "pl-3" : ""}>{item.name}</div>
              </DropdownMenuItem>
            );
          })}

        {/* <TreeView data={tree as any} /> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
