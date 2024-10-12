/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  content$,
  draft$,
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
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { Node } from "@prisma/client";
import { editor } from "monaco-editor";
import { type RegisterCompletionOptions } from "monacopilot";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import useSWR from "swr";
import { useDebouncedCallback } from "use-debounce";
import { registerFormatters } from "../monaco/actions";
import { autoCloseTag } from "../monaco/auto-close-tag";
import { updateDiffDecorations } from "../monaco/diff";
import {
  registerBackSlashIntellisense,
  registerComponentIntellisense,
} from "../monaco/intellisense";
import { onDropFile } from "../monaco/on-drop-file";
import { pasteHandler } from "../monaco/on-paste";
import { editorOptions } from "../monaco/options";
import { registerSaveAction } from "../monaco/save";
import { registerTableFormatter } from "../monaco/table";
import { NodeNotFound } from "./errors";
import { FileDropTarget } from "./file-drop-target";
import { PagePreview } from "./page-preview";
import { EditorSkeleton } from "./skeletons";

export const PageEditor = ({
  siteId,
  pageId,
}: {
  siteId: string;
  pageId: string | null;
}) => {
  const theme = useTheme();
  const monaco = useMonaco();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decoratorsRef = useRef<editor.IEditorDecorationsCollection | null>();

  const { data, isLoading, error, isValidating } = useSWR<Node>(
    `/api/site/${siteId}/nodes/${pageId}`,
    fetcher,
  );

  /*------ Effects --------*/

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
    if (!monaco) return;
    const backSlashIntellisenseDisposer = registerBackSlashIntellisense(monaco);
    // const componentIntellisenseDisposer = registerComponentIntellisense(monaco);

    return () => {
      backSlashIntellisenseDisposer.dispose();
      // componentIntellisenseDisposer.dispose();
    };
  }, [monaco, editorRef.current]);

  useEffect(() => {
    return () => {
      if (monaco) monaco.editor.getModels().forEach((model) => model.dispose());
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

  const aiAutoCompleteOptions = {
    endpoint: `/api/complete`,
    language: "mdx",
    trigger: "onTyping",
    onError: (error) => {
      console.error(error);
    },
  } satisfies RegisterCompletionOptions;

  const handleEditorDidMount = (
    _editor: editor.IStandaloneCodeEditor,
    _monaco: Monaco,
  ) => {
    editorRef.current = _editor;
    registerSaveAction(_editor, _monaco, save);
    registerTableFormatter(_editor, _monaco);
    registerFormatters(_editor, _monaco);
    // registerCompletion(_monaco, _editor, aiAutoCompleteOptions);
    const decorators = editorRef.current.createDecorationsCollection([]);
    decoratorsRef.current = decorators;
    decorationsDebounce(editorRef.current.getValue());
  };

  if (error) return <NodeNotFound />;

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={55} minSize={10}>
        {isLoading ? (
          <>
            <EditorSkeleton />
          </>
        ) : (
          <FileDropTarget
            regex={/\.(png|svg|jpg|gif|mp4|mov|webm)$/}
            onDrop={(file) =>
              onDropFile(file, editorRef.current, monaco, siteId)
            }
          >
            <Editor
              height="100%"
              defaultLanguage="mdx"
              value={data?.draft || ""}
              onMount={handleEditorDidMount}
              theme={theme.theme === "dark" ? "vs-dark" : "vs-light"}
              options={editorOptions}
              onChange={(value, changeEvent) => {
                saveStatus$.set("saving");

                if (value && value?.length > 8000) {
                  debouncedLg(value);
                } else if (value && value?.length > 3000) {
                  debouncedSm(value);
                } else {
                  draft$.set(value);
                }

                decorationsDebounce(value);
                saveDebounce(value);
                autoCloseTag(editorRef.current, monaco, changeEvent);
              }}
              loading={<EditorSkeleton />}
            />
          </FileDropTarget>
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={45} minSize={10}>
        {data && <PagePreview node={data} nodeLoading={isLoading} />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
