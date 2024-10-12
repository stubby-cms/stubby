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
    return `curl -X POST ${process.env.NEXT_PUBLIC_HOST}/api
    -H "Content-Type: application/json
    -H "Authorization: Bearer ${options.apiKey}
    -d '{
      "siteId": "${options.siteId}",
      "requestFor": "${options.requestFor}"
    }'`;
  } else if (options.requestFor === "aPage") {
    if (options.pageSlug)
      return `curl -X POST ${process.env.NEXT_PUBLIC_HOST}/api
    -H "Content-Type: application/json
    -H "Authorization: Bearer ${options.apiKey}
    -d '{
      "siteId": "${options.siteId}",
      "requestFor": "${options.requestFor}",
      "pageSlug": "${options.pageSlug}"
    }'`;
    else if (options.pageId)
      return `curl -X POST ${process.env.NEXT_PUBLIC_HOST}/api
    -H "Content-Type: application/json
    -H "Authorization: Bearer ${options.apiKey}
    -d '{
      "siteId": "${options.siteId}",
      "requestFor": "${options.requestFor}",
      "pageId": "${options.pageId}"
    }'`;
    else if (options.pageSlug && options.pageId)
      return `curl -X POST ${process.env.NEXT_PUBLIC_HOST}/api
    -H "Content-Type: application/json
    -H "Authorization: Bearer ${options.apiKey}
    -d '{
      "siteId": "${options.siteId}",
      "requestFor": "${options.requestFor}",
      "pageSlug": "${options.pageSlug}",
      "pageId": "${options.pageId}"
    }'`;
    else
      return `curl -X POST ${process.env.NEXT_PUBLIC_HOST}/api
    -H "Content-Type: application/json
    -H "Authorization: Bearer ${options.apiKey}
    -d '{
      "siteId": "${options.siteId}",
      "requestFor": "${options.requestFor}"
    }'`;
  }
};

const getJSCode = (options: CodeOptions) => {
  let requestOptions = ``;

  if (options.requestFor === "allPages") {
    requestOptions = `    requestFor: "${options.requestFor}"`;
  } else if (options.requestFor === "aPage") {
    if (options.pageSlug)
      requestOptions = `    requestFor: "${options.requestFor}",
    pageSlug: "${options.pageSlug}"`;
    else if (options.pageId)
      requestOptions = `    requestFor: "${options.requestFor}",
    pageId: "${options.pageId}"`;
    else if (options.pageSlug && options.pageId)
      requestOptions = `    requestFor: "${options.requestFor}",
    pageSlug: "${options.pageSlug}",
    pageId: "${options.pageId}"`;
    else requestOptions = `    requestFor: "${options.requestFor}"`;
  }

  return `const res = await fetch(\`${process.env.NEXT_PUBLIC_HOST}/api/get\`, {
  method: "POST",
  body: JSON.stringify({
    siteId: "${options.siteId}",\n${requestOptions}
  }),
  headers: {
    "Authorization": \`Bearer ${options.apiKey}\`, 
  }
});

const data = await res.json(); 
`;
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
      className="api-container api-tabs"
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

      <div className="code-sample-code-container">
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
            },
          }}
        >
          {code as string}
        </SyntaxHighlighter>
      </div>
    </Tabs>
  );
};
