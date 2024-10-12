interface Node {
  name: string;
  displayName: string;
  id: string;
  parentId: string | null;
  isFolder: boolean;
}

export function createFileSystem(
  nodes: Node[],
): Record<string, { name: string; type: "file" | "dir"; data: any }[]> {
  const pathMap: Record<
    string,
    { name: string; displayName: string; type: "file" | "dir"; data: any }[]
  > = {};

  // Helper function to get full path of a node
  const getFullPath = (node: Node): string => {
    let path = node.id;
    let current = node;
    while (current.parentId) {
      const parent = nodes.find((n) => n.id === current.parentId);
      if (parent) {
        path = parent.id + "/" + path;
        current = parent;
      } else {
        break;
      }
    }
    return "/" + path;
  };

  if (nodes) {
    nodes.forEach((node) => {
      const fullPath = getFullPath(node);
      const parentPath =
        fullPath.substring(0, fullPath.lastIndexOf("/")) || "/";

      if (!pathMap[parentPath]) {
        pathMap[parentPath] = [];
      }

      const itemData: Partial<Node> = {
        id: node.id,
        parentId: node.parentId,
        isFolder: node.isFolder,
        displayName: node.name,
      };

      const itemType = node.isFolder ? "dir" : "file";

      pathMap[parentPath].push({
        name: fullPath,
        displayName: node.name,
        type: itemType,
        data: itemData,
      });

      // Create an entry for directories
      if (node.isFolder && !pathMap[fullPath]) {
        pathMap[fullPath] = [];
      }
    });
  }

  return pathMap;
}
