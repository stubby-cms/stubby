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
  user: User;
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
      newItem.frontmatter = item.output?.frontmatter;
      delete newItem.output;

      return {
        ...newItem,
        children: createTree(data, item.id),
      };
    });
}
