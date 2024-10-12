"use client";

import { Site } from "@prisma/client";
import { createContext, useContext } from "react";

export const SiteSettingsContext = createContext<Site | null>(null);

export const SiteSettingsProvider = ({
  children,
  site,
}: {
  children: React.ReactNode;
  site: Site;
}) => {
  return (
    <SiteSettingsContext.Provider value={site}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const site = useContext(SiteSettingsContext);
  if (!site) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider",
    );
  }
  return site;
};
