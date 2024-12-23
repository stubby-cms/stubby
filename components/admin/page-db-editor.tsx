/* eslint-disable react-hooks/exhaustive-deps */
import "@glideapps/glide-data-grid/dist/index.css";

import { useParams, useSearchParams } from "next/navigation";

import {
  dbCols$,
  dbContent$,
  nodeMetadata$,
  saveStatus$,
} from "@/app/dashboard/state";
import {
  CompactSelection,
  DataEditor,
  DataEditorRef,
  EditableGridCell,
  GridCell,
  GridCellKind,
  GridColumn,
  GridColumnIcon,
  GridSelection,
  Item,
  Rectangle,
} from "@glideapps/glide-data-grid";
import { observer } from "@legendapp/state/react";
import { JsonArray } from "@prisma/client/runtime/library";
import { cloneDeep } from "lodash";
import { PencilLineIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ArticleCellProps, richTextCellRendered } from "./cells/rich-text-cell";
import { NewColumnPopover } from "./new-column";
import { PageDbPreview } from "./page-db-preview";
import { useTheme } from "next-themes";
import { darkTheme } from "./db-theme";
import { PageDbEditorHeader } from "./page-db-editor-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { EditColumnForm } from "./edit-column";
import { toast } from "sonner";
import { Button } from "../ui/button";

const getColumnTypeIcon = (type: string) => {
  switch (type) {
    case "text":
      return GridColumnIcon.HeaderString;
    case "number":
      return GridColumnIcon.HeaderNumber;
    case "boolean":
      return GridColumnIcon.HeaderBoolean;
    case "date":
      return GridColumnIcon.HeaderDate;
    case "image":
      return GridColumnIcon.HeaderImage;
    case "url":
      return GridColumnIcon.HeaderUri;
    case "email":
      return GridColumnIcon.HeaderEmail;
    case "json":
      return GridColumnIcon.HeaderJoinStrings;
    case "richText":
      return GridColumnIcon.HeaderMarkdown;
    default:
      return GridColumnIcon.HeaderString;
  }
};

export const PageDbEditor = observer(() => {
  const siteId = useParams().siteId;
  const pageId = useSearchParams().get("id");
  const { mutate } = useSWRConfig();
  const hasResized = useRef(new Set<number>());
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] =
    useState(false);

  const cols = ((dbCols$.get() as any) || []).map(
    (
      c: GridColumn & {
        type: string;
      },
      i: number,
    ) =>
      ({
        ...c,
        hasMenu: true,
        icon: getColumnTypeIcon(c.type),
        grow: hasResized.current.has(i) ? undefined : (5 + i) / 5,
      }) satisfies GridColumn,
  ) as GridColumn[];

  const data = dbContent$.get();

  const [selection, setSelection] = useState<GridSelection>({
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty(),
  });

  const windowRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<DataEditorRef | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [bounds, setBounds] = useState<Rectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [colIndex, setColIndex] = useState(-1);

  /* Callbacks */
  const save = useCallback(async (newData: any) => {
    try {
      saveStatus$.set("saving");
      const res = await fetch(`/api/site/${siteId}/nodes/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dbContent: newData, type: "db" }),
      });

      if (res.ok && res.status < 300) {
        saveStatus$.set("saved");
      } else {
        toast.error("Error saving data, try again later");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const deleteColumn = useCallback(async () => {
    if (colIndex === -1) return;
    const deleteColumn = cols[colIndex];
    if (!deleteColumn) return;
    const newCols = cloneDeep(cols);
    newCols.splice(colIndex, 1);

    const newData = cloneDeep(data);

    if (!newData) return;

    newData?.forEach((row: any) => {
      delete row[deleteColumn.id as string];
    });

    try {
      saveStatus$.set("saving");
      const res = await fetch(`/api/site/${siteId}/nodes/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dbContent: newData,
          type: "db",
          dbCols: newCols,
        }),
      });

      if (res.ok && res.status < 300) {
        mutate(`/api/site/${siteId}/nodes/${pageId}`);
        saveStatus$.set("saved");
      } else {
        saveStatus$.set("error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      saveStatus$.set("saved");
    }

    setMenuOpen(false);
    setBounds({ x: 0, y: 0, width: 0, height: 0 });
  }, [colIndex, cols]);

  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      if (!data)
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          displayData: "",
          data: "",
        };

      const [col, row] = cell;
      const dataRow = data[row] as any;

      const colInfo = cols[col] as GridColumn & {
        type: string;
      };
      const indexes: any = cols.map((c) => c.id);
      const d = dataRow ? dataRow[indexes[col]] : null;

      if (colInfo?.type === "richText") {
        return {
          kind: GridCellKind.Custom,
          allowOverlay: true,
          copyData: d,
          readonly: false,
          data: {
            kind: "article-cell",
            content: d || "",
          },
        };
      }

      return {
        kind: GridCellKind.Text,
        allowOverlay: true,
        readonly: false,
        displayData: d || "",
        data: d || "",
      };
    },
    [data, cols],
  );

  const onCellEdited = useCallback(
    (cell: Item, newValue: EditableGridCell) => {
      const indexes: any = cols.map((c) => c.id);
      const [col, row] = cell;
      const key = indexes[col];
      const newData: any = cloneDeep(dbContent$.peek());

      if (newValue.kind === GridCellKind.Text) {
        newData[row][key] = newValue.data;
      } else if (newValue.kind === GridCellKind.Custom) {
        if ((newValue.data as ArticleCellProps).kind === "article-cell") {
          newData[row][key] = (newValue.data as ArticleCellProps).content;
        }
      }

      dbContent$.set(newData);
      save(newData);
    },
    [data, cols],
  );

  const onColumnResize = useCallback(
    (column: GridColumn, newSize: number) => {
      const index = cols.findIndex((ci) => ci.title === column.title);
      const newArray: GridColumn[] = [...cols];
      newArray.splice(index, 1, {
        ...cols[index],
        width: newSize,
      });

      dbCols$.set(newArray as any as JsonArray);
    },
    [data, cols],
  );

  const onHeaderMenuClick = useCallback(
    (col: number, bounds: Rectangle) => {
      setBounds(bounds);
      setColIndex(col);

      setTimeout(() => {
        setMenuOpen(true);
      }, 10);
    },
    [data, cols],
  );

  const onRowAppended = useCallback(() => {
    const newData = cloneDeep(data);
    const newRow: any = {};
    cols.forEach((col) => {
      newRow[col.id as string] = "";
    });

    newData?.push(newRow);
    dbContent$.set(newData);
    save(newData);
  }, [data, cols]);

  const onDelete = useCallback(
    (selection: GridSelection) => {
      if (!data) return false;

      if (selection.rows.length > 0) {
        const newData = [];
        const rowIndexesToDelete = selection.rows.toArray();

        for (let i = 0; i < data.length; i++) {
          if (!rowIndexesToDelete.includes(i)) {
            newData.push(data[i]);
          }
        }

        dbContent$.set(newData);
        save(newData);

        setSelection({
          columns: CompactSelection.empty(),
          rows: CompactSelection.empty(),
        });

        return false;
      } else {
        return true;
      }
    },
    [data],
  );

  return (
    <>
      <div className="h-screen w-screen overflow-hidden" ref={windowRef}>
        <ResizablePanelGroup
          direction="horizontal"
          className="db-editor border-b"
        >
          <ResizablePanel
            defaultSize={65}
            minSize={10}
            className="h-screen bg-background"
          >
            <PageDbEditorHeader />
            <div className="relative">
              {data && (
                <DataEditor
                  ref={tableRef}
                  getCellContent={getCellContent}
                  columns={cols}
                  theme={theme.theme === "dark" ? darkTheme : {}}
                  rows={data?.length}
                  width={"100%"}
                  gridSelection={selection}
                  onDelete={onDelete}
                  onGridSelectionChange={setSelection}
                  rowSelect="multi"
                  rowSelectionMode="multi"
                  headerHeight={39}
                  getCellsForSelection={true}
                  onColumnResize={onColumnResize}
                  onHeaderMenuClick={onHeaderMenuClick}
                  customRenderers={[richTextCellRendered]}
                  preventDiagonalScrolling={true}
                  rightElement={
                    <div className="flex h-full w-[60px] flex-col bg-gray-50 dark:bg-gray-900">
                      <NewColumnPopover cols={cols} />
                    </div>
                  }
                  rightElementProps={{
                    sticky: true,
                    fill: false,
                  }}
                  onCellEdited={onCellEdited}
                  trailingRowOptions={{
                    hint: "New row...",
                    sticky: true,
                    tint: false,
                    targetColumn: 0,
                  }}
                  rowMarkers="both"
                  smoothScrollX={true}
                  overscrollX={0}
                  overscrollY={0}
                  freezeColumns={1}
                  onRowAppended={onRowAppended}
                />
              )}

              <button
                className="absolute bottom-0 h-[33px] w-full cursor-pointer border-b bg-background pl-5 hover:bg-muted"
                onClick={(e) => {
                  tableRef.current?.appendRow(0);
                }}
              >
                <div className="flex h-full items-center gap-2 text-sm text-muted-foreground">
                  <PlusIcon size={16} />
                  Add row
                </div>
              </button>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={35}
            minSize={10}
            className="h-screen overflow-y-auto"
          >
            <div className="h-screen w-full bg-background">
              <PageDbPreview />
            </div>
          </ResizablePanel>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div
                style={{
                  position: "fixed",
                  left: bounds.width + bounds.x - 40,
                  top: bounds.y,
                  width: 40,
                  height: bounds.height,
                }}
              ></div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              updatePositionStrategy="always"
              align="end"
              style={{
                width: bounds.width,
                maxWidth: "200px",
              }}
            >
              <DropdownMenuItem
                onSelect={() => {
                  setDialogOpen(true);
                }}
              >
                <PencilLineIcon
                  size={16}
                  className="mr-2 text-muted-foreground"
                />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteConfirmationDialogOpen(true);
                }}
              >
                <TrashIcon
                  size={16}
                  className="mr-2 text-muted-foreground"
                ></TrashIcon>
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog
            onOpenChange={setDeleteConfirmationDialogOpen}
            open={deleteConfirmationDialogOpen}
          >
            <DialogContent>
              <DialogTitle>
                Delete column{" "}
                <code className="rounded-sm bg-muted px-1 text-sm text-muted-foreground">
                  {cols[colIndex]?.title}
                </code>
              </DialogTitle>
              <VisuallyHidden>
                <DialogDescription>
                  Are you sure you want to delete this column?
                </DialogDescription>
              </VisuallyHidden>
              <div className="text-muted-foreground">
                This action cannot be undone and will delete all data in this
                column
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setDeleteConfirmationDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={"brand"}
                  onClick={() => {
                    deleteColumn();
                    setDeleteConfirmationDialogOpen(false);
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
            <DialogContent>
              <DialogTitle>Rename column</DialogTitle>
              <VisuallyHidden>
                <DialogDescription>Rename column</DialogDescription>
              </VisuallyHidden>

              <EditColumnForm
                cols={cols}
                currentColIndex={colIndex}
                setDialogOpen={setDialogOpen}
                save={save}
              />
            </DialogContent>
          </Dialog>
        </ResizablePanelGroup>
      </div>
    </>
  );
});
