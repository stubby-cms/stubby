"use client";

import { extractFrontMatter } from "@/lib/extract-frontmatter";
import Markdown from "markdown-to-jsx";
import { ErrorBoundary } from "react-error-boundary";
import { components } from "./components";
import { MdFallback } from "./fallbacks";

export function MdPreview({ md }: { md: string }) {
  const { content, data } = extractFrontMatter(md);

  return (
    <ErrorBoundary FallbackComponent={MdFallback}>
      {data && data.title && <h1>{data.title}</h1>}
      {content && (
        <Markdown
          options={{
            overrides: components,
          }}
        >
          {content}
        </Markdown>
      )}
    </ErrorBoundary>
  );
}
