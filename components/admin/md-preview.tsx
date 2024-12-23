"use client";

import { extractFrontMatter } from "@/lib/frontmatter";
import Markdown from "markdown-to-jsx";
import { ErrorBoundary } from "react-error-boundary";
import { components } from "./components";
import { MdFallback } from "./fallbacks";
import { PreBlockClient } from "../content/code.client";

export function MdPreviewClient({ mdx }: { mdx: string }) {
  const { content, data } = extractFrontMatter(mdx);

  return (
    <ErrorBoundary FallbackComponent={MdFallback}>
      {data && data.title && <h1>{data.title}</h1>}
      {content && (
        <Markdown
          options={{
            overrides: {
              ...components,
              pre: PreBlockClient,
            },
          }}
        >
          {content}
        </Markdown>
      )}
    </ErrorBoundary>
  );
}
