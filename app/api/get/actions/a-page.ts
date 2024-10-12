import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to get sibling pages within the same folder
const getSiblingPages = async (parentId: string, siteId: string) => {
  return await prisma.node.findMany({
    where: { siteId, parentId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, title: true },
  });
};

// Helper function to get the parent folder
const getParentFolder = async (parentId: string, siteId: string) => {
  return await prisma.node.findFirst({
    where: { id: parentId, siteId },
    select: { id: true, name: true, slug: true, parentId: true },
  });
};

// Helper function to get sibling folders (previous and next)
const getSiblingFolders = async (parentFolder: any, siteId: string) => {
  const siblingFolders = await prisma.node.findMany({
    where: { siteId, parentId: parentFolder.parentId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const currentFolderIndex = siblingFolders.findIndex(
    (folder) => folder.id === parentFolder.id,
  );

  return {
    nextFolder: siblingFolders[currentFolderIndex + 1] || null,
    previousFolder: siblingFolders[currentFolderIndex - 1] || null,
  };
};

// Helper function to get the first child page of a folder
const getFirstChildPage = async (
  parentId: string,
  siteId: string,
  order: "asc" | "desc",
) => {
  return await prisma.node.findFirst({
    where: { siteId, parentId },
    orderBy: { name: order },
    select: { id: true, name: true, slug: true, title: true },
  });
};

// Helper function to select common page fields
const selectPageFields = () => ({
  id: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  slug: true,
  title: true,
  content: true,
  output: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
});

// Helper function to create error responses
const createErrorResponse = (message: string, status: number) => {
  return NextResponse.json({ message }, { status });
};

// Main function to find next and previous pages
const findAdjacentPages = async (page: any, siteId: string) => {
  let nextPage = null;
  let previousPage = null;

  const siblingPages = await getSiblingPages(page.parentId, siteId);

  const currentIndex = siblingPages.findIndex(
    (sibling) => sibling.id === page.id,
  );

  // Assign next and previous siblings
  nextPage = siblingPages[currentIndex + 1] || null;
  previousPage = siblingPages[currentIndex - 1] || null;

  if (page.parentId == null || page.parentId == undefined) {
    return { nextPage, previousPage };
  }

  // If either next or previous page is not found, check for adjacent folders
  if (!nextPage || !previousPage) {
    const parentFolder = await getParentFolder(page.parentId, siteId);

    if (parentFolder) {
      const { nextFolder, previousFolder } = await getSiblingFolders(
        parentFolder,
        siteId,
      );

      // Fetch next page from the next folder if nextPage not found
      if (!nextPage && nextFolder) {
        nextPage = await getFirstChildPage(nextFolder.id, siteId, "asc");
      }

      // Fetch previous page from the previous folder if previousPage not found
      if (!previousPage && previousFolder) {
        previousPage = await getFirstChildPage(
          previousFolder.id,
          siteId,
          "desc",
        );
      }
    }
  }

  return { nextPage, previousPage };
};

export async function getAPage(data: any) {
  const { pageSlug, siteId, pageId } = data;

  if (!pageSlug && !pageId) {
    return createErrorResponse("One of pageId or pageSlug is required", 400);
  }

  if (pageSlug && pageId) {
    return createErrorResponse(
      "Only one of pageId or pageSlug must be passed",
      400,
    );
  }

  const whereClause = pageId ? { id: pageId } : { slug: pageSlug };

  try {
    const currentPage = await prisma.node.findFirst({
      where: { ...whereClause, siteId },
      select: selectPageFields(),
    });

    if (!currentPage) {
      return createErrorResponse("Page not found", 404);
    }

    const { nextPage, previousPage } = await findAdjacentPages(
      currentPage,
      siteId,
    );

    return NextResponse.json({ ...currentPage, nextPage, previousPage });
  } catch (error: any) {
    return createErrorResponse(error.message, 400);
  }
}
