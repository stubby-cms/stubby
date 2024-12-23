"use client";

import { NoNodes } from "@/components/admin/errors";
import Nodes from "@/components/admin/nodes";
import { PageEditor } from "@/components/admin/page-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Spinner } from "@/components/ui/spinner";
import { fetcher } from "@/lib/utils";
import { Node } from "@prisma/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import useSWR from "swr";

export default function SitePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const pageId = searchParams.get("id");

  const { data: nodes, isLoading: nodesLoading } = useSWR<Node[]>(
    `/api/site/${siteId}/nodes`,
    fetcher,
  );

  useEffect(() => {
    if (!pageId) {
      const id = localStorage.getItem(`${siteId}-last-visited`);
      if (id) {
        router.push(`/dashboard/${siteId}/content?id=${id}`);
      } else {
        const firstFile = nodes?.find((node) => node.isFolder == false);
        if (firstFile) {
          localStorage.setItem(`${siteId}-last-visited`, firstFile.id);
          router.push(`/dashboard/${siteId}/content?id=${firstFile.id}`);
        }
      }
    }
  }, [pageId, siteId, router, nodes]);

  if (nodesLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {nodes && nodes.length == 0 ? (
        <NoNodes />
      ) : (
        <>{pageId && <PageEditor key={`${siteId}-${pageId}`}></PageEditor>}</>
      )}
    </>
  );
}
