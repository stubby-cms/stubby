export const getAllNodesQueryFn = async (siteId: string) => {
  return fetch(`/api/site/${siteId}/nodes`).then((res) => res.json());
};
