import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createErrorResponse } from "../../../../../utils/errors";

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
  dbContent: true,
  type: true,
  owner: {
    select: {
      name: true,
      email: true,
    },
  },
});

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

export async function getAPage(siteId: string, slugOrId: string) {
  try {
    let currentPage = await prisma.node.findFirst({
      where: { id: slugOrId, siteId },
      select: selectPageFields(),
    });

    if (!currentPage) {
      currentPage = await prisma.node.findFirst({
        where: { slug: slugOrId, siteId },
        select: selectPageFields(),
      });
    }

    if (!currentPage) {
      return createErrorResponse("Page not found", 404);
    }

    if (currentPage.type == "db") {
      return NextResponse.json(currentPage.dbContent);
    }

    const { dbContent, type, owner, output, ...allFileFields } = currentPage;

    const { nextPage, previousPage } = await findAdjacentPages(
      allFileFields,
      siteId,
    );

    return NextResponse.json({
      ...allFileFields,
      ...(output as any),
      author: owner,
      nextPage,
      previousPage,
    });
  } catch (error: any) {
    return createErrorResponse(error.message, 400);
  }
}
