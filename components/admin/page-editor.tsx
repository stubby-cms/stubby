/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  content$,
  dbCols$,
  dbContent$,
  draft$,
  nodeMetadata$,
  publishedAt$,
} from "@/app/dashboard/state";
import { fetcher } from "@/lib/utils";
import { Node } from "@prisma/client";
import { JsonArray } from "@prisma/client/runtime/library";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { NodeNotFound } from "./errors";
import { PageDbEditor } from "./page-db-editor";
import { PageFileEditor } from "./page-file-editor";
import { EditorSkeleton } from "./skeletons";

export const PageEditor = () => {
  const siteId = useParams().siteId as string;
  const pageId = useSearchParams().get("id");

  const { data, isLoading, error, isValidating } = useSWR<Node>(
    `/api/site/${siteId}/nodes/${pageId}`,
    fetcher,
  );

  /*------ Effects --------*/

  useEffect(() => {
    if (isLoading || isValidating || !data) return;
    draft$.set(data.draft || "");
    content$.set(data.content || "");
    publishedAt$.set(
      data.publishedAt ? new Date(data.publishedAt!).getDate() : false,
    );
    dbContent$.set(data.dbContent as JsonArray);
    dbCols$.set(data.dbCols as JsonArray);
    nodeMetadata$.set({
      id: data.id,
      slug: data.slug,
      title: data.title || "",
      name: data.name,
      publishedAt: data.publishedAt,
    });
  }, [data, isLoading]);

  if (error) return <NodeNotFound />;

  return (
    <>
      {isLoading ? (
        <EditorSkeleton />
      ) : (
        <>
          {data?.type === "db" && <PageDbEditor />}
          {data?.type === "file" && <PageFileEditor />}
        </>
      )}
    </>
  );
};
