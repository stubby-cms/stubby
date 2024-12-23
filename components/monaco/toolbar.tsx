import {
  BoldIcon,
  CirclePlusIcon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  TableIcon,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MdxEditor } from "./mdx-editor";
import { snippets } from "./snippets";

export const MonacoEditorToolbar = ({
  mdxEditor,
}: {
  mdxEditor: MdxEditor | null;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toolbarItems = [
    {
      icon: CirclePlusIcon,
      tooltip: "Insert",
      children: [
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "-",
        "table",
        "code",
        "-",
        "note",
        "tip",
        "warning",
        "info",
      ].map((snippetKey) => {
        const snippet = snippets[snippetKey];

        if (snippetKey === "-") {
          return {
            divider: true,
          };
        }

        return {
          onClick: () => {
            mdxEditor?.insertSnippet(snippetKey);
          },
          tooltip: snippet.label,
        };
      }),
    },
    {
      icon: BoldIcon,
      onClick: () => {
        mdxEditor?.triggerAction("bold");
      },
      tooltip: "Bold",
    },
    {
      icon: ItalicIcon,
      onClick: () => {
        mdxEditor?.triggerAction("italics");
      },
      tooltip: "Italic",
    },
    {
      icon: ListOrderedIcon,
      onClick: () => {
        mdxEditor?.insertSnippet("numberedList");
      },
      tooltip: "Numbered List",
    },
    {
      icon: ListIcon,
      onClick: () => {
        mdxEditor?.insertSnippet("list");
      },
      tooltip: "Bulleted List",
    },
    {
      icon: QuoteIcon,
      onClick: () => {
        mdxEditor?.insertSnippet("quote");
      },
      tooltip: "Blockquote",
    },
    {
      icon: LinkIcon,
      onClick: () => {
        mdxEditor?.insertSnippet("link");
      },
      tooltip: "Link",
    },
    {
      icon: ImageIcon,
      onClick: () => {
        mdxEditor?.insertSnippet("image");
      },
      tooltip: "Image",
    },
  ];

  if (!mdxEditor) {
    return null;
  }

  return (
    <div className="flex gap-1">
      {toolbarItems.map((item) => {
        return item.children ? (
          <DropdownMenu
            key={item.tooltip}
            open={isMenuOpen}
            onOpenChange={setIsMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <button className="toolbar-inline-button outline-none">
                <item.icon size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              onFocusOutside={(e) => {
                e.preventDefault();
              }}
            >
              {item.children.map((child, i) => {
                if (child.divider) {
                  return <DropdownMenuSeparator key={i} />;
                }

                return (
                  <DropdownMenuItem
                    key={child.tooltip}
                    onSelect={() => {
                      setTimeout(() => {
                        if (child.onClick) child.onClick();
                        mdxEditor?.focus();
                      }, 0);
                    }}
                  >
                    {child.tooltip}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            key={item.tooltip}
            onClick={() => {
              item.onClick();
              mdxEditor?.focus();
            }}
            className="toolbar-inline-button"
          >
            <item.icon size={16} />
          </button>
        );
      })}
    </div>
  );
};
