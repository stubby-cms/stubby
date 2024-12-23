import { fetcher } from "@/lib/utils";
import { DiffEditor } from "@monaco-editor/react";
import { Node } from "@prisma/client";
import type { editor as EditorType } from "monaco-editor";
import { useTheme } from "next-themes";
import { useParams, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const editorOptions = {
  fontSize: 13,
  lineHeight: 20,
  fontFamily: "var(--font-mono)",
  minimap: {
    enabled: false,
  },
  wordWrap: "bounded",
  wordWrapColumn: 80,
  wrappingIndent: "same",
  tabCompletion: "onlySnippets",
  scrollBeyondLastLine: false,
  scrollBeyondLastColumn: 10,
  padding: {
    top: 10,
    bottom: 50,
  },
  renderLineHighlight: "all",
  renderLineHighlightOnlyWhenFocus: true,
  readOnly: true,
  originalEditable: false,
} as EditorType.IStandaloneEditorConstructionOptions;

export const DiffViewer = ({
  setOpen,
  version,
}: {
  setOpen: (open: boolean) => void;
  version: string;
}) => {
  const diffEditorRef = useRef(null);
  const theme = useTheme();
  const [isMutating, setIsMutating] = useState(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const pageId = searchParams.get("id");

  const siteId = params.siteId as string;

  const { data: node, isLoading: nodeLoading } = useSWR<Node>(
    `/api/site/${siteId}/nodes/${pageId}?v=${version}`,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateIfStale: false,
    },
  );

  function handleEditorDidMount(editor: any, monaco: any) {
    diffEditorRef.current = editor;
  }

  const handlePublish = async () => {
    setIsMutating(true);
    try {
      const res = await fetch(`/api/site/${siteId}/nodes/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          content: node?.draft,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsMutating(false);
        toast.success("Published successfully!");
        mutate(`/api/site/${siteId}/nodes/${pageId}`);
        setOpen(false);
      } else {
        setIsMutating(false);
        toast.error(data.error.message);
      }
    } catch (error) {
      setIsMutating(false);
    }
  };

  if (nodeLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="dialog-content" style={{ height: "90vh" }}>
      <div className="flex h-16 items-center justify-between border-b px-7">
        <div className="flex items-center gap-2 text-sm">
          <pre className="mt-1 font-mono" style={{ lineHeight: 1 }}>
            Slug: <span className="text-muted-foreground">{node?.slug}</span>
          </pre>
        </div>
        <div>
          <Button
            onClick={handlePublish}
            loading={isMutating}
            variant={"brand"}
          >
            Publish
          </Button>
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden rounded-b-xl"
        style={{
          height: "calc(100% - 64px)",
        }}
      >
        <DiffEditor
          height="100%"
          language="mdx"
          options={editorOptions}
          original={node?.content || ""}
          modified={node?.draft || ""}
          theme={theme.theme == "dark" ? "vs-dark" : "vs"}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
};
