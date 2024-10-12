"use client";

import { getId } from "@/lib/utils";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import { defaultPageContent, defaultPageContentOutput } from "@/lib/consts";

export const NodeNotFound = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="font-brand text-2xl">
          404 — Page not found<span className="text-brand">.</span>
        </h1>
        <p className="mt-2 text-gray-500">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
};

export const NoNodes = () => {
  const id = getId(4);
  const router = useRouter();
  const siteId = useParams().siteId as string;

  const addNode = () => {
    const newNode = {
      name: `untitled-${id}`,
      isFolder: false,
      parentId: null,
      title: "Title of the page",
      slug: `title-of-the-page-${id}`,
    };

    // store.addNode(newNode, siteId, router);
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="font-brand text-2xl">
          No pages yet<span className="text-brand">•</span>
        </h1>
        <p className="mt-2 text-gray-500">Create a new page to get started.</p>
        <Button
          className="mt-4 px-4"
          size={"sm"}
          variant={"brand"}
          onClick={addNode}
        >
          Create page
        </Button>
      </div>
    </div>
  );
};
