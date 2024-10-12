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
import { Shapes, WrapText } from "lucide-react";
import { editor as EditorType } from "monaco-editor";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import useSWR from "swr";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import prettyBytes from "pretty-bytes";
import { CodeSamples } from "./code-samples";

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/get`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${siteData?.apiKey}`,
      },
      body: JSON.stringify({
        siteId: siteId,
        requestFor: requestFor,
        pageSlug: pageSlug,
        pageId: pageId,
      }),
    });
    const resData = await res.json();
    let time2 = performance.now();
    setTimeTaken(time2 - time1);
    setIsLoading(false);
    setStatusCode(res.status);
    setResponseSize(byteSize(JSON.stringify(resData)));
    editorRef.current?.setValue(JSON.stringify(resData, null, 2));
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
    { label: "allPages", value: "allPages" },
    { label: "aPage", value: "aPage" },
  ];

  const [requestFor, setRequestFor] = useState("allPages");
  const [pageSlug, setPageSlug] = useState("");
  const [pageId, setPageId] = useState("");

  return (
    <div className="main-chrome">
      <div className="container mt-10 flex gap-4">
        <div className="flex w-2/5 flex-col gap-5 overflow-y-auto pb-10 pr-8">
          <div className="endpoint-container flex items-center gap-5">
            <div className="url-container playground-field flex items-center gap-2">
              <span className="playground-method-badge">GET</span>
              <code className="url text-sm">
                {process.env.NEXT_PUBLIC_HOST}/api/get
              </code>
            </div>
            <Button onClick={sendRequest} variant={"brand"} loading={isLoading}>
              Send
            </Button>
          </div>

          <div className="headers-container api-container">
            <div className="api-container-title">Headers</div>
            <div className="api-container-content">
              <div className="api-field-container">
                <div className="api-field-label">Authorization</div>
                <div className="api-field">
                  <code className="font-semibold text-slate-500">Bearer</code>
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

              <div className="api-field-container">
                <div className="api-field-label">requestFor</div>
                <div className="">
                  <Select onValueChange={setRequestFor} defaultValue="allPages">
                    <SelectTrigger className="font-mono">
                      <SelectValue
                        placeholder="allPages"
                        className="font-mono"
                      />
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
                </div>
              </div>

              {requestFor == "aPage" && (
                <>
                  <div className="api-field-container">
                    <div className="api-field-label">
                      pageSlug <small className="optional-badge">*</small>
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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-8 w-8 items-center justify-center gap-2 rounded-md outline-none hover:bg-slate-200 dark:hover:bg-slate-800">
                            <Shapes size={20} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-w-[300px]">
                          {allNodes
                            ?.filter((e) => !e.isFolder)
                            .map((node) => (
                              <DropdownMenuItem
                                key={node.id}
                                onSelect={() => {
                                  setPageId("");
                                  setPageSlug(node.slug);
                                }}
                                className="cursor-pointer font-mono"
                                title={node.slug}
                              >
                                <span className="truncate">{node.slug}</span>
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="api-field-container">
                    <div className="api-field-label">
                      pageId <small className="optional-badge">*</small>
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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-8 w-8 items-center justify-center gap-2 rounded-md outline-none hover:bg-slate-200 dark:hover:bg-slate-800">
                            <Shapes size={20} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-w-[300px]">
                          {allNodes
                            ?.filter((e) => !e.isFolder)
                            .map((node) => (
                              <DropdownMenuItem
                                key={node.id}
                                onSelect={() => {
                                  setPageId(node.id);
                                  setPageSlug("");
                                }}
                                className="font-mono"
                                title={node.id}
                              >
                                <div className="flex cursor-pointer flex-col items-start justify-start">
                                  <div className="truncate">{node.id}</div>
                                  <div className="text-xs text-slate-500">
                                    <div className="w-[200px] truncate">
                                      {node.slug}
                                    </div>
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="help-container flex items-center gap-2 text-sm">
                    <small className="optional-badge flex items-center justify-center font-mono leading-none">
                      *
                    </small>{" "}
                    <span className="opacity-60">
                      Only one of <code className="font-semibold">pageId</code>{" "}
                      or <code className="font-semibold">pageSlug</code> is
                      required
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
