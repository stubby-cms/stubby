"use client";

import { createFileSystem } from "@/lib/tree";
import { absoluteUrl, fetcher } from "@/lib/utils";
import { createFileTree, type FileTreeSnapshot } from "exploration";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { PageBrowser } from "./page-browser";
import { NodesSkeleton } from "./skeletons";
import { addNodeFn } from "@/app/dashboard/node-actions";
import { nodeMutationStatus$ } from "@/app/dashboard/state";

export interface Node {
  id: string;
  name: string;
  displayName: string;
  isFolder: boolean;
  parentId: string | null;
}

const sortFn = (a: Node, b: Node) => {
  if (a.isFolder && !b.isFolder) return -1;
  if (!a.isFolder && b.isFolder) return 1;
  return a.displayName.localeCompare(b.displayName);
};

const Nodes = ({ siteId }: { siteId: string }) => {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const { data, isLoading } = useSWR<Node[]>(
    `/api/site/${siteId}/nodes`,
    fetcher,
  );

  const tree = useMemo(() => {
    if (!data || isLoading) return null;

    let nodes = createFileSystem(data);
    if (data.length == 0) {
      nodes = { "/": [] };
    }

    let snapshot: any = localStorage.getItem(`${siteId}-tree-state`);

    if (snapshot) {
      snapshot = JSON.parse(snapshot) as FileTreeSnapshot;
    }

    return createFileTree(
      (parent, { createFile, createDir }) => {
        return Promise.resolve(
          nodes[parent.data.name].map((stat) => {
            const d = { name: stat.name, ...stat.data };
            return stat.type === "file" ? createFile(d) : createDir(d);
          }),
        );
      },
      {
        comparator: (a, b) => sortFn(a.data as Node, b.data as Node),
        restoreFromSnapshot: typeof snapshot == "object" ? snapshot : null,
      },
    );
  }, [data, isLoading, siteId]);

  const deleteNode = async (nodeId: string) => {
    nodeMutationStatus$.set("deleting");

    try {
      const res = await fetch(
        absoluteUrl(`/api/site/${siteId}/nodes/${nodeId}`),
        {
          method: "DELETE",
        },
      );

      const json = await res.json();

      if (json.message == "success") {
        await mutate(`/api/site/${siteId}/nodes`);
        if (localStorage.getItem(`${siteId}-last-visited`) == nodeId) {
          localStorage.removeItem(`${siteId}-last-visited`);
          router.push(`/dashboard/${siteId}/content`);
        }
      }

      nodeMutationStatus$.set(false);
    } catch (error) {
      nodeMutationStatus$.set(false);

      console.log(error);
    }
  };

  const addNode = (newNode: Partial<Node>) =>
    addNodeFn(newNode, siteId, router);

  const updateNode = async (node: Partial<Node>) => {
    nodeMutationStatus$.set("updating");

    try {
      const data: any = {};

      if (node.name) {
        data["name"] = node.name;
      }

      if (node.parentId) {
        data["parentId"] = node.parentId;
      }

      const res = await fetch(
        absoluteUrl(`/api/site/${siteId}/nodes/${node.id}`),
        {
          method: "PATCH",
          body: JSON.stringify(data || "{}"),
        },
      );

      const resData = await res.json();
      if (resData.message == "success") {
        await mutate(`/api/site/${siteId}/nodes`);
      }
      nodeMutationStatus$.set(false);
    } catch (err) {
      nodeMutationStatus$.set(false);
      toast.error("Something went wrong, try again later.");
    }
  };

  if (isLoading) {
    return <NodesSkeleton />;
  }

  return (
    <div className="flex flex-col">
      {tree && (
        <PageBrowser
          deleteNode={deleteNode}
          addNode={addNode}
          updateNode={updateNode}
          tree={tree}
        ></PageBrowser>
      )}
    </div>
  );
};

export default Nodes;
