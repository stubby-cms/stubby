import { absoluteUrl } from "@/lib/utils";
import { mutate } from "swr";
import { nodeMutationStatus$ } from "./state";

export interface Node {
  id: string;
  name: string;
  displayName: string;
  isFolder: boolean;
  parentId: string | null;
}

export const addNodeFn = async (
  newNode: Partial<Node>,
  siteId: string,
  router: any,
) => {
  nodeMutationStatus$.set("creating");

  try {
    const res = await fetch(absoluteUrl(`/api/site/${siteId}/nodes`), {
      method: "POST",
      body: JSON.stringify({
        ...newNode,
      }),
    });
    const json = await res.json();

    if (json.message == "success") {
      await mutate(`/api/site/${siteId}/nodes`);
      localStorage.setItem(`${siteId}-last-visited`, json.id);
      if (json.isFolder == false)
        router.push(`/dashboard/${siteId}/content?id=${json.id}`);
    }

    nodeMutationStatus$.set(false);
  } catch (error) {
    console.log(error);
    nodeMutationStatus$.set(false);
  }
};
