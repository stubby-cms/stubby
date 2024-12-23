/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  schemaActions,
  SchemaField,
  schemaStore$,
} from "@/app/dashboard/[siteId]/schema/state";
import {
  content$,
  draft$,
  isCommandPaletteOpen$,
  lastSaved$,
  publishedAt$,
  saveStatus$,
} from "@/app/dashboard/state";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { fetcher } from "@/lib/utils";
import { observer } from "@legendapp/state/react";
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { Node, Schema } from "@prisma/client";
import { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useDebouncedCallback } from "use-debounce";
import { updateDiffDecorations } from "../monaco/diff";
import {
  makeAndApplyCodeActionsForFrontMatter,
  makeAndApplyFrontMatterMarkers,
  makeAndApplySpellCheckMarkers,
  makeApplyCodeActionsForSpellCheck,
} from "../monaco/markers";
import { MdxEditor } from "../monaco/mdx-editor";
import { type MdxEditor as MdxEditorType } from "../monaco/mdx-editor";
import { onDropFile } from "../monaco/on-drop-file";
import { pasteHandler } from "../monaco/on-paste";
import { editorOptions } from "../monaco/options";
import { registerSaveAction } from "../monaco/save";
import { MonacoEditorToolbar } from "../monaco/toolbar";
import { TooltipProvider } from "../ui/tooltip";
import { NodeNotFound } from "./errors";
import { FileDropTarget } from "./file-drop-target";
import { PagePreview } from "./page-preview";
import { SaveStatus } from "./page-save-satus";
import { PageSchemaSelector } from "./page-schema-selector";
import { PublishDialog } from "./publish";
import { EditorSkeleton } from "./skeletons";

export const PageFileEditor = observer(() => {
  const siteId = useParams().siteId as string;
  const pageId = useSearchParams().get("id");

  const theme = useTheme();
  const monaco = useMonaco();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decoratorsRef = useRef<editor.IEditorDecorationsCollection | null>();
  const lintWorkerRef = useRef<any>();
  const [workerWasmLoaded, setWasmLoaded] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<Schema | null>(null);
  const [mdxEditorInstance, setMdxEditorInstance] =
    useState<MdxEditorType | null>();

  const { data, isLoading, error, isValidating } = useSWR<Node>(
    `/api/site/${siteId}/nodes/${pageId}`,
    fetcher,
  );

  const schemasSwr = useSWR<Schema[]>(`/api/site/${siteId}/schema`, fetcher);
  const schemas = schemaStore$.get().schemas;

  /*------ Effects --------*/

  useEffect(() => {
    if (
      schemasSwr.isLoading ||
      schemasSwr.error ||
      schemasSwr.isValidating ||
      !schemasSwr.data
    )
      return;

    schemaActions.populateFromServer(schemasSwr.data);
    setCurrentSchema(
      schemasSwr.data.find((s) => s.id === data?.schemaId) || null,
    );
  }, [schemasSwr.data, schemasSwr.error, schemasSwr.isLoading]);

  useEffect(() => {
    if (isLoading || isValidating || !data) return;
    draft$.set(data.draft || "");
    content$.set(data.content || "");
    publishedAt$.set(
      data.publishedAt ? new Date(data.publishedAt!).getDate() : false,
    );

    decorationsDebounce(data.content || "");
  }, [data, isLoading]);

  useEffect(() => {
    return () => {
      if (monaco) monaco.editor.getModels().forEach((model) => model.dispose());
      MdxEditor.destroyInstance();
    };
  }, [pageId]);

  useEffect(() => {
    const _pasteHandler = (event: any) =>
      pasteHandler(event, editorRef.current, monaco, siteId);

    window.addEventListener("paste", _pasteHandler, false);
    return () => {
      window.removeEventListener("paste", _pasteHandler);
    };
  }, []);

  useEffect(() => {
    lintWorkerRef.current = new Worker(
      new URL("../../components/monaco/lint.worker.ts", import.meta.url),
    );

    lintWorkerRef.current.postMessage({ type: "init" });

    lintWorkerRef.current.addEventListener("message", (event: any) => {
      if (event.data.type === "loaded") {
        setWasmLoaded(true);
      }

      if (event.data.type == "lint") {
        makeAndApplySpellCheckMarkers(
          event.data.errors,
          monacoRef.current,
          editorRef.current?.getModel(),
        );

        makeApplyCodeActionsForSpellCheck(event.data.errors, monacoRef.current);
      }

      if (event.data.type == "frontmatter-lint") {
        makeAndApplyFrontMatterMarkers(
          event.data.errors,
          monacoRef.current,
          editorRef.current?.getModel(),
        );

        makeAndApplyCodeActionsForFrontMatter(
          event.data.errors,
          monacoRef.current,
        );
      }
    });

    return () => {
      lintWorkerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerWasmLoaded && modelLoaded) {
      lintWorkerRef.current.postMessage({
        value: editorRef.current?.getValue(),
        schema: data?.schemaId ? schemas[data?.schemaId || ""] : "",
        type: "lint",
      });
    }
  }, [workerWasmLoaded, modelLoaded]);

  useEffect(() => {
    if (
      !editorRef.current ||
      !monacoRef.current ||
      !currentSchema ||
      !mdxEditorInstance
    )
      return;

    mdxEditorInstance.registerFrontMatterSuggestions(
      currentSchema.fields || [],
    );
  }, [editorRef.current, monacoRef.current, currentSchema, mdxEditorInstance]);

  /*-------- Hooks ---------*/

  const debouncedLg = useDebouncedCallback((value) => {
    draft$.set(value);
  }, 750);

  const debouncedSm = useDebouncedCallback((value) => {
    draft$.set(value);
  }, 200);

  const saveDebounce = useDebouncedCallback((value) => {
    save();
  }, 1000);

  const decorationsDebounce = useDebouncedCallback((value) => {
    updateDiffDecorations(
      editorRef.current,
      data?.content || "",
      decoratorsRef.current!,
    );
  }, 50);

  const spellCheckDebounce = useDebouncedCallback((value) => {
    lintWorkerRef.current.postMessage({
      value,
      type: "lint",
      schema: schemaStore$.get().schemas[data?.schemaId || ""],
    });
  }, 200);

  /*--------Handlers for editor---------*/

  const save = async () => {
    try {
      const draft = editorRef.current?.getValue() || "";

      await fetch(`/api/site/${siteId}/nodes/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ draft: draft }),
      });

      lastSaved$.set(Date.now());
      saveStatus$.set("saved");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditorDidMount = (
    _editor: editor.IStandaloneCodeEditor,
    _monaco: Monaco,
  ) => {
    editorRef.current = _editor;
    monacoRef.current = _monaco;

    setMdxEditorInstance(MdxEditor.getInstance(_monaco, _editor));

    registerSaveAction(_editor, _monaco, save);
    const decorators = editorRef.current.createDecorationsCollection([]);
    decoratorsRef.current = decorators;
    decorationsDebounce(editorRef.current.getValue());
    setModelLoaded(true);

    editorRef.current.addCommand(
      _monaco.KeyMod.CtrlCmd | _monaco.KeyCode.Period,
      () => {
        const position = editorRef.current?.getPosition();

        if (position) {
          document.querySelector(".mdx-editor")?.classList.add("manual-widget");
          editorRef.current?.trigger("", "editor.action.quickFix", {});
        }
      },
    );

    editorRef.current.addCommand(
      _monaco.KeyMod.CtrlCmd | _monaco.KeyCode.KeyK,
      () => {
        isCommandPaletteOpen$.set(true);
      },
    );

    editorRef.current.focus();
  };

  const toolbar = useMemo(() => {
    if (mdxEditorInstance) {
      return (
        <div className="flex items-center rounded-lg border bg-background px-0.5 py-0.5 text-sm font-medium">
          <MonacoEditorToolbar mdxEditor={mdxEditorInstance} />
        </div>
      );
    } else {
      return null;
    }
  }, [mdxEditorInstance]);

  const schemaPicker = useMemo(() => {
    return <PageSchemaSelector schemaId={data?.schemaId ?? ""} />;
  }, []);

  const status = useMemo(() => {
    return (
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <SaveStatus />
          <PublishDialog />
        </TooltipProvider>
      </div>
    );
  }, []);

  if (error) return <NodeNotFound />;

  return (
    <ResizablePanelGroup direction="horizontal" className="mdx-editor h-screen">
      <ResizablePanel defaultSize={55} minSize={10}>
        {isLoading ? (
          <>
            <EditorSkeleton />
          </>
        ) : (
          <div className="relative h-full w-full">
            <div className="top-gradient"></div>
            <div className="editor-header absolute left-4 right-4 top-1 z-50 flex items-center justify-between rounded-full px-1 py-1">
              <div className="flex items-center gap-3">
                {toolbar}
                {schemaPicker}
              </div>
              {status}
            </div>

            <FileDropTarget
              regex={/\.(png|svg|jpg|gif|mp4|mov|webm)$/}
              onDrop={(file) =>
                onDropFile(file, editorRef.current, monaco, siteId)
              }
            >
              <div className="flex flex-col items-center">
                <Editor
                  defaultLanguage="mdx"
                  height={"100vh"}
                  value={data?.draft || ""}
                  onMount={handleEditorDidMount}
                  theme={
                    theme.theme === "dark" || theme.systemTheme
                      ? "vs-dark"
                      : "vs-light"
                  }
                  options={editorOptions}
                  onChange={(value, changeEvent) => {
                    saveStatus$.set("saving");

                    if (value && value?.length > 8000) {
                      debouncedLg(value);
                    } else if (value && value?.length > 3000) {
                      debouncedSm(value);
                    } else if (value) {
                      draft$.set(value);
                    } else {
                      // No-op for now
                    }

                    decorationsDebounce(value);
                    saveDebounce(value);
                    spellCheckDebounce(value);
                  }}
                  loading={<EditorSkeleton />}
                />
              </div>
            </FileDropTarget>
          </div>
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={45} minSize={0}>
        {data && <PagePreview node={data} nodeLoading={isLoading} />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
});
