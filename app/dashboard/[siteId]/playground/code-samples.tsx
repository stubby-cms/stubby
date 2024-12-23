/* eslint-disable react-hooks/exhaustive-deps */
import { CopyButton } from "@/components/common/copy-button";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/cjs/styles/prism/material-dark";

type CodeOptions = {
  siteId: string;
  pageId: string;
  pageSlug: string;
  requestFor: string;
  apiKey: string | undefined | null;
};

const getCurlCode = (options: CodeOptions) => {
  if (options.requestFor === "allPages") {
    return `curl -X GET ${process.env.NEXT_PUBLIC_HOST}/api/v1/sites/${options.siteId}/folders?apiKey=${options.apiKey}`;
  } else if (options.requestFor === "aPage") {
    return `curl -X GET ${process.env.NEXT_PUBLIC_HOST}/api/v1/sites/${options.siteId}/pages/${options.pageId || options.pageSlug}?apiKey=${options.apiKey}`;
  }
};

const getJSCode = (options: CodeOptions) => {
  if (options.requestFor === "allPages") {
    return `
const url = new URL(\`https://stubby.io/api/v1/sites/${options.siteId}/folders\`);
url.searchParams.append("apiKey", "${options.apiKey}");
const res = await fetch(url.href);
const data = await res.json();
`.trim();
  }

  return `
const url = new URL(\`https://stubby.io/api/v1/sites/${options.siteId}/pages/${options.pageId || options.pageSlug}\`);
url.searchParams.append("apiKey", "${options.apiKey}");
const res = await fetch(url.href);
const data = await res.json(); 
`.trim();
};

export const CodeSamples = ({ options }: { options: CodeOptions }) => {
  const [activeTab, setActiveTab] = useState("javascript");
  const [code, setCode] = useState("");

  const getCode = (lang: string) => {
    switch (lang) {
      case "javascript":
        return getJSCode(options);
      case "bash":
        return getCurlCode(options);
      default:
        return "";
    }
  };

  useEffect(() => {
    setCode(getCode(activeTab) as string);
  }, [activeTab, options]);

  const snippets = [
    {
      title: "Javascript",
      lang: "javascript",
    },
    {
      title: "cURL",
      lang: "bash",
    },
  ];

  const currentTab =
    snippets.find((tab) => tab.title === activeTab) || snippets[0];

  return (
    <Tabs
      defaultValue={activeTab}
      className="api-container api-tabs w-full overscroll-x-auto"
      onValueChange={setActiveTab}
    >
      <TabsList className="code-samples-header">
        <div className="flex">
          {snippets.map((tab) => {
            return (
              <TabsTrigger
                key={tab.lang}
                value={tab.lang}
                className="code-sample-tab"
              >
                <div className="code-sample-tab-title">{tab.title}</div>
              </TabsTrigger>
            );
          })}
        </div>

        <CopyButton theme={"dark"} value={code} />
      </TabsList>

      <div className="code-sample-code-container max-w-full overflow-auto">
        <SyntaxHighlighter
          customStyle={{
            fontFamily: "var(--font-mono)",
            borderRadius: "12px",
            background: "transparent",
            border: "none",
            lineHeight: "1.25",
            margin: "0",
            paddingTop: 12,
          }}
          language={currentTab?.lang}
          style={style}
          wrapLines={false}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              whiteSpace: "break-spaces",
            },
          }}
        >
          {code as string}
        </SyntaxHighlighter>
      </div>
    </Tabs>
  );
};
