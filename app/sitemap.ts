import { MetadataRoute } from "next";
import { getAllPagesFn } from "./api/get/actions/all-pages";

const site = `${process.env.NEXT_PUBLIC_HOST}` || "https://stubby.io";

const getDocData = async () => {
  const data = getAllPagesFn("vmmtuch");
  return data;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getDocData();

  const posts = ((data as any) || []).map((page: any) => ({
    url: `${site}/docs/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: site,
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${site}/privacy`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${site}/pricing`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${site}/login`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${site}/toc`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site}/docs`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...posts,
  ];
}
