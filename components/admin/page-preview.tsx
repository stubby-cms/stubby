"use client";

import { draft$ } from "@/app/dashboard/state";
import { observer } from "@legendapp/state/react";
import { Node } from "@prisma/client";
import { MdSkeleton } from "./skeletons";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const MdPreviewClient = dynamic(() =>
  import("./md-preview").then((mod) => mod.MdPreviewClient),
);

export const PagePreview = observer(
  ({ node, nodeLoading }: { node: Node | undefined; nodeLoading: boolean }) => {
    const draft = draft$.get();

    if (nodeLoading) return <MdSkeleton />;

    return (
      <>
        {nodeLoading ? (
          <MdSkeleton />
        ) : (
          <>
            {node && (
              <div id="preview" className="h-screen w-full overflow-y-auto">
                {/* <div className="flex h-10 justify-between border-b px-10">
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
              </div> */}
                <div className="article prose p-10 dark:prose-dark">
                  <Suspense fallback={<MdSkeleton />}>
                    <MdPreviewClient mdx={draft}></MdPreviewClient>
                  </Suspense>
                </div>
              </div>
            )}
          </>
        )}
      </>
    );
  },
);
