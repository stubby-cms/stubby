/* eslint-disable @next/next/no-img-element */
"use client";

import { nodeMutationStatus$ } from "@/app/dashboard/state";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getId } from "@/lib/utils";
import { observer } from "@legendapp/state/react";
import { useHotkeys as useHotkeys_ } from "@react-hook/hotkey";
import clsx from "clsx";
import {
  FileTree,
  FileTreeNode,
  Node,
  isDir,
  isFile,
  useDnd,
  useFileTreeSnapshot,
  useObserver,
  useRovingFocus,
  useSelections,
  useTraits,
  useVirtualize,
} from "exploration";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SyntheticEvent, useRef, useState } from "react";
import { CommandKPanel } from "./cmd-k";
import { Db, Edit, Folder, FolderOpened, Markdown, Trash } from "./icons";
import { PageBrowserActions } from "./page-browser-actions";
import { PageBrowserHeader } from "./page-browser-header";
import { PageBrowserFooter } from "./page-browser-footer";

const Lines = ({ depth, nodeId }: { depth: number; nodeId: string }) => {
  const lines = [];
  for (let i = 1; i < depth; i++) {
    lines.push(
      <div
        key={`${nodeId}-${i}-${depth}`}
        className={`line line-depth-${i}`}
      ></div>,
    );
  }
  return <>{lines}</>;
};

export const PageBrowser = observer(
  ({
    tree,
    addNode,
    deleteNode,
    updateNode,
  }: {
    tree: FileTree<{}>;
    addNode: any;
    deleteNode: any;
    updateNode: any;
  }) => {
    const nodeMutationStatus = nodeMutationStatus$.get();

    const windowRef = useRef<HTMLDivElement | null>(null);
    const rovingFocus = useRovingFocus(tree);
    const selections = useSelections(tree);
    const traits = useTraits(tree, ["selected", "focused", "drop-target"]);
    const dnd = useDnd(tree, { windowRef });
    const virtualize = useVirtualize(tree, {
      windowRef,
      nodeHeight: 32,
    });
    const [currentFolder, setCurrentFolder] = useState<any>(null);
    const [currentFile, setCurrentFile] = useState<any>(null);
    const [isRenaming, setIsRenaming] = useState(-1);

    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const pageId = searchParams.get("id");
    const siteId = params.siteId as string;

    const [previouslySelectedNode, setPreviouslySelectedNode] =
      useState<FileTreeNode | null>();

    useFileTreeSnapshot(tree, (state) => {
      localStorage.setItem(`${siteId}-tree-state`, JSON.stringify(state));
      setPreviouslySelectedNode(null);
    });

    // useHotkeys(tree, { windowRef: window, rovingFocus, selections });

    const getSelectedId = () => {
      const rovingId = rovingFocus.didChange.getState();
      return rovingId > -1 ? rovingId : (selections.tail ?? -1);
    };

    const getSelectedNodeByPageId = () => {
      const node = tree.nodesById.find(
        (node) =>
          node && node.data && (node.data as any).id === pageId && isFile(node),
      );

      return node ? node : tree.root;
    };

    const isInputEl = (event: KeyboardEvent) =>
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable);

    useHotkeys_(windowRef, [
      [
        "enter",
        (event) => {
          if (isInputEl(event)) return;
          event.preventDefault();
          setIsRenaming(getSelectedId());
        },
      ],
      [
        "esc",
        (event) => {
          if (isInputEl(event)) {
            setIsRenaming(-1);
            const current = tree.getById(getSelectedId());
            if (
              current &&
              current.data &&
              current.data.meta &&
              (current.data?.meta as any).draft == true
            ) {
              tree.remove(current);
            }
            return;
          }
        },
      ],
    ]);

    useObserver(selections.didChange, (value: any) => {
      const selected = [...value];
      traits.set("selected", selected);

      if (selected.length === 1) {
        const node = tree.getById(selected[0]);

        if (node && isDir(node)) {
          setCurrentFolder(node);
          setCurrentFile(null);
        }

        if (node && isFile(node)) {
          setCurrentFile(node);
          setCurrentFolder(null);
          localStorage.setItem(`${siteId}-last-visited`, (node.data as any).id);
          router.push(
            `/dashboard/${siteId}/content?id=${(node.data as any).id}`,
          );
        }
      }
    });

    useObserver(rovingFocus.didChange, (value) => {
      traits.set("focused", [value]);
    });

    useObserver(dnd.didChange, (event) => {
      if (!event) return;

      if (event.type === "enter" || event.type === "expanded") {
        if (event.node.parentId === event.dir.id) {
          return traits.clear("drop-target");
        }

        const nodes = event.dir.nodes ? [...event.dir.nodes] : [];
        const nodeIds: number[] = [event.dir.id, ...nodes];
        let nodeId: number | undefined;

        while ((nodeId = nodes.pop())) {
          const node = tree.getById(nodeId);

          if (node) {
            if (isDir(node) && node.nodes) {
              nodeIds.push(...node.nodes);
              nodes.push(...node.nodes);
            }
          }
        }

        traits.set("drop-target", nodeIds);
      } else if (event.type === "drop") {
        traits.clear("drop-target");
        const selected = new Set(selections.narrow());

        if (
          event.node === event.dir ||
          (selected.has(event.node.id) && selected.has(event.dir.id))
        ) {
          return;
        }

        if (selected.has(event.node.id)) {
          const moveSelections = async () => {
            if (!tree.isVisible(event.dir)) {
              await tree.expand(event.dir);
            }

            const promises: Promise<void>[] = [];

            for (const id of selected) {
              const node: any = tree.getById(id);

              if (node) {
                promises.push(tree.move(node, event.dir));
              }
            }

            await Promise.all(promises);
          };

          moveSelections();
          selections.clear();
        } else {
          // @ts-ignore
          tree.move(event.node, event.dir);

          const parentId = (event.dir.data as any).id
            ? (event.dir.data as any).id
            : "root";

          updateNode({
            id: (event.node.data as any).id,
            parentId: parentId,
          });
        }
      } else if (event.type === "end") {
        traits.clear("drop-target");
      }
    });

    const plugins = [traits, rovingFocus, selections, dnd];

    const addFile = (fileType: "db" | "json" | "file") => {
      const id = getId(6);
      let node = tree.getById(getSelectedId());

      if (!node) node = previouslySelectedNode as FileTreeNode;
      if (!node) node = getSelectedNodeByPageId();
      if (!node) node = tree.root;

      setPreviouslySelectedNode(node);

      const parent = isDir(node) ? node : node.parent ? node.parent : tree.root;

      const newNode = tree.newFile(parent, {
        displayName: "",
        name: "",
        isFolder: false,
        id: id,
        parentId: (parent.data as any).id ? (parent.data as any).id : null,
        slug: undefined,
        type: fileType,
        meta: {
          draft: true,
        },
      } as any);

      if (parent) tree.expand(parent);
      setIsRenaming(newNode.id);
    };

    const addFolder = () => {
      const id = getId(6);

      let node = tree.getById(getSelectedId());

      if (!node) node = previouslySelectedNode as FileTreeNode;
      if (!node) node = getSelectedNodeByPageId();
      if (!node) node = tree.root;

      setPreviouslySelectedNode(node);

      const parent = isDir(node) ? node : node.parent ? node.parent : tree.root;

      const newDir = tree.newDir(parent, {
        displayName: "",
        name: "",
        isFolder: true,
        id: id,
        parentId: (parent.data as any).id ? (parent.data as any).id : null,
        slug: undefined,
        meta: {
          draft: true,
        },
      } as any);

      if (parent) tree.expand(parent);
      setIsRenaming(newDir.id);
    };

    const removeFileOrFolder = (id?: string) => {
      if (id) {
        deleteNode(id);
        return;
      }

      if (currentFolder) {
        deleteNode(currentFolder.data.id);
      }

      if (currentFile) {
        deleteNode(currentFile.data.id);
      }
    };

    const handleRenameOnBlur = (e: any, { node }: any) => {
      if (
        node.data &&
        node.data.meta &&
        node.data.meta.draft &&
        (!e.target.value || e.target.value.trim() != "")
      ) {
        tree.remove(node);
      }
      setIsRenaming(-1);
    };

    const handleRename = async (event: SyntheticEvent, { node }: any) => {
      event.preventDefault();
      const target = event.target as typeof event.target & {
        name: { value: string };
      };

      const name = target.name.value;

      if (!node || !name || !name.trim()) return;

      if (node.data.meta?.draft) {
        await addNode({
          id: node.data.id,
          isFolder: node.data.isFolder,
          parentId: node.data.parentId,
          displayName: name,
          name: name,
          type: node.data.type,
        });

        setIsRenaming(-1);
      } else {
        node.data.displayName = name;
        setIsRenaming(-1);
        updateNode({
          id: node.data.id,
          displayName: name,
          draft: undefined,
          name,
        });
      }
    };

    return (
      <div className="h-screen bg-secondary/40 dark:bg-secondary/20">
        <PageBrowserHeader />
        <PageBrowserActions addFile={addFile} addFolder={addFolder} />
        <div
          ref={windowRef}
          className="explorer"
          style={{
            height: "calc(100vh - 88px - 88px - 32px)",
          }}
        >
          <div {...virtualize.props} className="overflow-y-auto">
            {virtualize.map((props) => {
              return (
                <Node
                  plugins={plugins}
                  {...props}
                  key={`${props.node.basename}-${props.node.depth}`}
                >
                  <>
                    <Lines
                      key={`lines-${props.node.basename}-${props.node.depth}`}
                      depth={props.node.depth}
                      nodeId={props.node.basename}
                    />

                    <div
                      className={clsx(
                        "node-item relative z-10 items-center justify-between",
                        {
                          "current-page font-semibold":
                            (props.node.data as any).id == pageId,
                        },
                      )}
                    >
                      <div className="node-item-content flex w-[inherit] items-center gap-2">
                        <div className="icon flex h-5 w-5 flex-shrink-0 items-center justify-center text-foreground/60">
                          {isDir(props.node) ? (
                            props.node.expanded ? (
                              <FolderOpened size={18} />
                            ) : (
                              <Folder size={18} />
                            )
                          ) : (
                            <>
                              {(props.node.data as any).type == "db" && (
                                <Db size={16} />
                              )}
                              {(props.node.data as any).type == "file" && (
                                <Markdown size={16} />
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden truncate pr-2 text-[13px]">
                          {isRenaming === props.node.id ? (
                            <form onSubmit={(e) => handleRename(e, props)}>
                              <input
                                autoFocus
                                type="text"
                                className={clsx(
                                  "inline-input",
                                  `n-${(props.node.data as any).id}`,
                                )}
                                defaultValue={
                                  (props.node.data as any).displayName
                                }
                                name="name"
                                autoComplete="off"
                                onBlur={(e) => handleRenameOnBlur(e, props)}
                                onFocus={(e) => {
                                  e.target.select();
                                }}
                              />
                            </form>
                          ) : (
                            <span className="text-foreground/70">
                              {(props.node.data as any).displayName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="actions">
                        {isRenaming === props.node.id ? null : (
                          <>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                  }}
                                  className="mini-button dark:hover:bg-white/10 dark:hover:text-white"
                                >
                                  <Trash />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                side="right"
                                className="w-[230px] rounded-lg border px-4 py-3"
                              >
                                <div className="text-sm font-medium text-muted-foreground">
                                  Are you sure? This cannot be undone.
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      event.preventDefault();
                                      removeFileOrFolder(
                                        (props.node.data as any).id,
                                      );
                                    }}
                                    className="sm-button-danger"
                                    disabled={nodeMutationStatus == "deleting"}
                                  >
                                    Yes
                                  </button>

                                  <PopoverClose className="sm-button-secondary">
                                    No
                                  </PopoverClose>

                                  {nodeMutationStatus == "deleting" && (
                                    <span className="text-sm text-muted-foreground">
                                      Deleting...
                                    </span>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                setIsRenaming(props.node.id);
                              }}
                              className="mini-button dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <Edit />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                </Node>
              );
            })}

            <div className="h-10"></div>
          </div>
        </div>
        <PageBrowserFooter />
        <CommandKPanel data={tree} />
      </div>
    );
  },
);
