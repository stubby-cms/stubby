"use client";

import { useEffect } from "react";

export const SetLoginCookie = () => {
  useEffect(() => {
    // This is a hack to set a cookie on the user's browser
    // when they visit the marketing site. This is used to
    // show the "Dashboard" button in the header.
    document.cookie = "stubby.auth=7N9UY8hsziiFUR3at4WNHvkJx; path=/";
  }, []);

  return null;
};

export const UnsetToken = () => {
  useEffect(() => {
    // This is a hack to unset a cookie on the user's browser
    // when they visit the marketing site. This is used to
    // hide the "Dashboard" button in the header.
    document.cookie = "stubby.auth=; path=/";
  }, []);

  return null;
};
