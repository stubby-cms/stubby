interface User {
  name: string;
  image: string;
  email: string;
}

interface DataItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  name: string;
  slug: string;
  title: string;
  output: any;
  owner: User;
}

interface TreeNode extends DataItem {
  children: TreeNode[];
}

export function createTree(
  data: DataItem[],
  parentId: string | null = null,
): TreeNode[] {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => {
      const newItem: any = structuredClone(item);
      newItem.metadata = item.output?.metadata;
      delete newItem.output;

      const children = createTree(data, item.id);

      return {
        ...newItem,
        children: children.length ? children : undefined,
      };
    });
}
