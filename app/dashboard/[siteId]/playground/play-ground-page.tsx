"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/utils";
import { Editor, Monaco } from "@monaco-editor/react";
import { Node, Site } from "@prisma/client";
import clsx from "clsx";
import { WrapText } from "lucide-react";
import { editor as EditorType } from "monaco-editor";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import useSWR from "swr";

import { useTheme } from "next-themes";
import prettyBytes from "pretty-bytes";
import { CodeSamples } from "./code-samples";
import { PageFinder } from "./page-finder";
import { toast } from "sonner";

export const PlaygroundPage = () => {
  const editorRef = useRef<EditorType.IStandaloneCodeEditor>();
  const params = useParams();
  const siteId = params.siteId as string;
  const theme = useTheme();

  const { data: allNodes, isLoading: allNodesLoading } = useSWR<Node[]>(
    `/api/site/${siteId}/nodes`,
    fetcher,
  );

  const { data: siteData, isLoading: siteDataLoading } = useSWR<Site>(
    `/api/site/${siteId}`,
    fetcher,
  );

  const [statusCode, setStatusCode] = useState<number>();
  const [timeTaken, setTimeTaken] = useState<number>();
  const [responseSize, setResponseSize] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  const byteSize = (str: string) => new Blob([str]).size;

  const sendRequest = async () => {
    let time1 = performance.now();
    setIsLoading(true);

    let url = new URL(
      `${process.env.NEXT_PUBLIC_HOST}/api/v1/sites/${siteId}/pages/${pageId || pageSlug}`,
    );

    if (requestFor === "allPages") {
      url = new URL(
        `${process.env.NEXT_PUBLIC_HOST}/api/v1/sites/${siteId}/folders`,
      );
    }

    const params = {
      apiKey: siteData?.apiKey || "",
    };

    url.search = new URLSearchParams(params).toString();

    try {
      const res = await fetch(url.toString());
      const resData = await res.json();

      let time2 = performance.now();
      setTimeTaken(time2 - time1);
      setIsLoading(false);
      setStatusCode(res.status);
      setResponseSize(byteSize(JSON.stringify(resData)));
      editorRef.current?.setValue(JSON.stringify(resData, null, 2));
    } catch (error) {
      setIsLoading(false);
      toast.error(`Failed to fetch data!`);
    }
  };

  function handleEditorDidMount(
    editor: EditorType.IStandaloneCodeEditor,
    monaco: Monaco,
  ) {
    editorRef.current = editor;
  }

  const [wordWrap, setWordWrap] = useState(true);
  const toggleWordWrapContent = () => {
    setWordWrap((w) => !w);
    setTimeout(() => {
      editorRef.current?.updateOptions({ wordWrap: wordWrap ? "on" : "off" });
    }, 1);
  };

  const requestForOptions = [
    { label: "Page", value: "aPage" },
    { label: "Folder", value: "allPages" },
  ];

  const [requestFor, setRequestFor] = useState("aPage");
  const [pageSlug, setPageSlug] = useState("");
  const [pageId, setPageId] = useState("");

  return (
    <div className="main-chrome">
      <div className="flex w-full gap-4 p-10">
        <div className="flex w-2/5 shrink-0 flex-col gap-5 overflow-y-auto pb-10 pr-8">
          <div className="flex items-center gap-10 pt-2">
            <div className="shrink-0 text-sm font-semibold">Endpoint</div>
            <Select onValueChange={setRequestFor} value={requestFor}>
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="aPage" className="font-mono" />
              </SelectTrigger>
              <SelectContent>
                {requestForOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    className="font-mono"
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={sendRequest} variant={"brand"} loading={isLoading}>
              Send
            </Button>
          </div>

          <div className="endpoint-container flex flex-col gap-2">
            <div className="url-container playground-field flex items-center gap-2">
              <span className="playground-method-badge">GET</span>

              {requestFor == "allPages" ? (
                <code className="url text-sm">
                  {`/api/v1/`}
                  <mark>{`{siteId}`}</mark>/folders
                </code>
              ) : (
                <code className="url text-sm">
                  {`/api/v1/`}
                  <mark>{`{siteId}`}</mark>/pages/<mark>{`{id or slug}`}</mark>
                </code>
              )}
            </div>
          </div>

          <div className="headers-container api-container">
            <div className="api-container-title">Query params</div>
            <div className="api-container-content">
              <div className="api-field-container">
                <div className="api-field-label">API Key</div>
                <div className="api-field">
                  <code>{siteData?.apiKey}</code>
                </div>
              </div>
            </div>
          </div>
          <div className="request-container api-container">
            <div className="api-container-title">Params</div>
            <div className="api-container-content">
              <div className="api-field-container">
                <div className="api-field-label">siteId</div>
                <div className="api-field">
                  <code>{siteId}</code>
                </div>
              </div>

              {requestFor == "aPage" && (
                <>
                  <div className="api-field-container">
                    <div className="api-field-label">
                      slug <small className="optional-badge">*</small>
                    </div>
                    <div className="api-field-dual flex items-center gap-3">
                      <div className="api-field">
                        <input
                          type="text"
                          value={pageSlug}
                          onChange={(e) => setPageSlug(e.target.value)}
                          className="w-full border-0 bg-transparent p-0 font-mono text-sm outline-none focus:ring-0"
                          placeholder="Enter the page slug"
                        />
                      </div>

                      <PageFinder
                        nodes={allNodes}
                        onSelect={(node) => {
                          setPageId("");
                          setPageSlug(node.slug);
                        }}
                      />
                    </div>
                  </div>

                  <div className="api-field-container">
                    <div className="api-field-label">
                      id <small className="optional-badge">*</small>
                    </div>
                    <div className="api-field-dual flex items-center gap-3">
                      <div className="api-field">
                        <input
                          type="text"
                          value={pageId}
                          onChange={(e) => setPageId(e.target.value)}
                          className="w-full border-0 bg-transparent p-0 font-mono text-sm outline-none focus:ring-0"
                          placeholder="Enter page id"
                        />
                      </div>

                      <PageFinder
                        nodes={allNodes}
                        onSelect={(node) => {
                          setPageSlug("");
                          setPageId(node.id);
                        }}
                      />
                    </div>
                  </div>

                  <div className="help-container flex items-center gap-2 text-sm">
                    <small className="optional-badge flex items-center justify-center font-mono leading-none">
                      *
                    </small>{" "}
                    <span className="opacity-60">
                      Only one of <code className="font-semibold">id</code> or{" "}
                      <code className="font-semibold">slug</code> is required
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div
          className="response-container flex-1"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <CodeSamples
            options={{
              pageId: pageId,
              pageSlug: pageSlug,
              siteId: siteId,
              requestFor: requestFor,
              apiKey: siteData?.apiKey,
            }}
          />
          <div className="h-5"></div>
          <div className="response-content api-container">
            <div className={clsx("api-container-title")}>
              <div className="flex items-center gap-2">
                Response
                {statusCode && (
                  <span
                    className={clsx("status-code text-slate-500", {
                      "status-error":
                        statusCode != undefined && statusCode >= 400,
                      "status-success":
                        statusCode != undefined &&
                        statusCode >= 200 &&
                        statusCode < 300,
                    })}
                  >
                    {statusCode.toString()}
                  </span>
                )}
                {timeTaken && (
                  <span className="time-taken text-slate-500">
                    {timeTaken.toFixed(2)} ms
                  </span>
                )}
                {responseSize && (
                  <span className="response-size ml-1 text-slate-500">
                    {prettyBytes(responseSize)}
                  </span>
                )}
              </div>
              <div>
                <button
                  onClick={toggleWordWrapContent}
                  className={clsx(
                    "flex h-7 w-7 items-center justify-center rounded-md outline-none hover:bg-slate-200 dark:hover:bg-slate-600",
                    {
                      "bg-slate-200 dark:bg-slate-700": !wordWrap,
                    },
                  )}
                  title="Toggle word wrap"
                >
                  <WrapText size={17} />
                </button>
              </div>
            </div>
            <div
              className="api-container-content-full h-full overflow-hidden"
              style={{ height: "calc(100vh - 288px - 80px)" }}
            >
              <Editor
                defaultLanguage="json"
                defaultValue="// Response will appear here"
                theme={theme.theme === "dark" ? "vs-dark" : "vs-light"}
                options={{
                  readOnly: true,
                  fontSize: 13,
                  lineHeight: 16,

                  fontFamily: "var(--font-mono)",
                  minimap: {
                    enabled: false,
                  },
                  scrollBeyondLastLine: false,
                  scrollBeyondLastColumn: 10,

                  scrollbar: {
                    useShadows: false,
                    verticalScrollbarSize: 8,
                    scrollByPage: true,
                    horizontalScrollbarSize: 8,
                  },
                  padding: {
                    top: 16,
                    bottom: 16,
                  },
                  contextmenu: false,
                  renderLineHighlight: "all",
                  renderLineHighlightOnlyWhenFocus: true,
                  lineNumbers: "off",
                  selectionHighlight: false,
                  foldingHighlight: false,
                  occurrencesHighlight: "off",
                  hideCursorInOverviewRuler: true,
                  overviewRulerLanes: 0,
                }}
                onMount={handleEditorDidMount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
