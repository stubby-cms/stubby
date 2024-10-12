"use client";

import { extractFrontMatter } from "@/lib/extract-frontmatter";
import Markdown from "markdown-to-jsx";
import { ErrorBoundary } from "react-error-boundary";
import { components } from "./components";
import { MdFallback } from "./fallbacks";
import { Node } from "@prisma/client";
import { MdSkeleton } from "./skeletons";
import { Key } from "lucide-react";
import { ShowApiEndPoint } from "./show-api-endpoint";
import { ShowFrontMatter } from "./show-front-matter";
import { draft$ } from "@/app/dashboard/state";

export function MdPreview({ mdx }: { mdx: string }) {
  const { content, data } = extractFrontMatter(mdx);

  return (
    <ErrorBoundary FallbackComponent={MdFallback}>
      {data && data.title && (
        <h1 className="title text-foreground">{data.title}</h1>
      )}
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

export function PagePreview({
  node,
  nodeLoading,
}: {
  node: Node | undefined;
  nodeLoading: boolean;
}) {
  const draft = draft$.get();

  if (nodeLoading) return <MdSkeleton />;

  return (
    <>
      {nodeLoading ? (
        <MdSkeleton />
      ) : (
        <>
          {node && (
            <div id="preview" className="h-full w-full overflow-y-auto">
              <div className="flex justify-between border-b px-10 py-2">
                <span className="flex items-center gap-2 overflow-hidden text-sm text-muted-foreground">
                  <span title="Slug">
                    <Key size={14} />
                  </span>
                  <span className="truncate">{node?.slug}</span>
                </span>

                <div className="flex items-center gap-3">
                  <ShowApiEndPoint slug={node?.slug!} />
                  <span className="text-muted-foreground">•</span>
                  <ShowFrontMatter data={(node?.output as any).frontmatter} />
                </div>
              </div>
              <div className="article prose p-10 dark:prose-dark">
                {node && <MdPreview mdx={draft}></MdPreview>}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
