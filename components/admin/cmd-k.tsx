import { isCommandPaletteOpen$ } from "@/app/dashboard/state";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { observer } from "@legendapp/state/react";
import { File, isDir, type FileTree } from "exploration";
import { FileType } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

export const CommandKPanel = observer(({ data }: { data: FileTree }) => {
  const router = useRouter();
  const pages: File["data"][] = [];
  const siteId = useParams().siteId;

  data.walk(data.root, (node) => {
    !isDir(node) ? pages.push(node.data) : null;
  });

  useHotkeys(
    ["meta+k", "meta+shift+p"],
    () => {
      isCommandPaletteOpen$.set(true);
    },
    [isCommandPaletteOpen$],
  );

  return (
    <CommandDialog
      open={isCommandPaletteOpen$.get()}
      onOpenChange={(val) => {
        isCommandPaletteOpen$.set(val);
      }}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="min-h-[320px]">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Files">
          {pages.map((page: any) => (
            <CommandItem
              key={page.id}
              onSelect={() => {
                isCommandPaletteOpen$.set(false);
                router.push(`/dashboard/${siteId}/content?id=${page.id}`);
              }}
            >
              <FileType className="mr-2 text-muted-foreground" />
              {page.displayName}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
});
