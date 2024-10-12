"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts: string[] = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export const DashboardButton = ({ path }: { path: string }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getCookie("stubby.auth");
    setIsAuthenticated(!!token);
  }, []);

  if (!isAuthenticated) {
    return (
      <Link className="font-medium text-foreground opacity-50" href={"/login"}>
        Login
      </Link>
    );
  }

  return (
    <Link
      className="font-medium text-foreground opacity-50"
      href={"/dashboard"}
    >
      Dashboard
    </Link>
  );
};
