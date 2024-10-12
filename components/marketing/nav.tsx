"use client";

/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoFull } from "../common/logo";
import { DashboardButton } from "./dashboard-button";

const linkClasses = "font-medium font-base py-1 flex text-muted-foreground";

export const Nav = () => {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [path]);

  return (
    <div className="fixed left-0 right-0 top-0 z-20 border-b bg-background">
      <div
        className={clsx("mx-auto flex items-center justify-between py-5", {
          container: path.startsWith("/docs"),
          "m-container": !path.startsWith("/docs"),
        })}
      >
        <div className="logo">
          <Link href="/" title="Stubby — Home">
            <LogoFull size={28} className="mx-auto" />
          </Link>
        </div>

        <div className="actions items-center md:flex">
          <div className="hidden sm:block">
            <ul className="m-nav-list flex space-x-10">
              <li>
                <Link
                  href="/"
                  className={clsx(
                    "font-medium text-foreground",
                    path === "/" ? "opacity-100" : "opacity-50",
                  )}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/quick-start"
                  className={clsx(
                    "font-medium text-foreground",
                    path.startsWith("/docs") ? "opacity-100" : "opacity-50",
                  )}
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className={clsx(
                    "font-medium text-foreground",
                    path.startsWith("/blog") ? "opacity-100" : "opacity-50",
                  )}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"/pricing"}
                  className={clsx(
                    "font-medium text-foreground",
                    path.startsWith("/pricing") ? "opacity-100" : "opacity-50",
                  )}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <DashboardButton path={path} />
              </li>
            </ul>
          </div>
          <div className="sm:hidden">
            <button
              className="m-nav-menu-button flex items-center"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
              }}
              title="Navigation menu"
            >
              <Menu />
            </button>
            <ul
              className={clsx(
                "absolute left-5 right-5 mt-4 flex flex-col gap-5 rounded-xl border bg-background p-5",
                {
                  hidden: !isMenuOpen,
                },
              )}
            >
              <li>
                <Link href="/" className={linkClasses}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/docs" className={linkClasses}>
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href={"/pricing"}
                  className={clsx(linkClasses, {
                    "font-medium": path.startsWith("/pricing"),
                  })}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href={`${process.env.NEXT_PUBLIC_HOST!}/login`}
                  className={linkClasses}
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
