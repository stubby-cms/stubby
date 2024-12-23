import "@/styles/index.scss";
import { Metadata } from "next";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { clsx } from "clsx";
import { DM_Mono, Figtree, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  preload: true,
  variable: "--font-sans",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  preload: true,
  variable: "--font-mono",
});

const heading = Figtree({
  subsets: ["latin"],
  weight: "800",
  preload: true,
  variable: "--font-brand",
});

const headingBold = Figtree({
  subsets: ["latin"],
  weight: "600",
  preload: true,
  variable: "--font-brand-semibold",
});

const title = "The simplest headless CMS you'll ever need - Stubby CMS";

const description =
  "Stubby CMS provides effortless content management for blogs, docs, and sites, with an API-first design, auto-revalidation with webhooks, a powerful mdx editor, and more.";

const keywords = [
  "mdx cms",
  "self-hosted headless cms",
  "mdx headless cms",
  "mdxjs website builder",
  "headless cms for developers",
  "mdx website integration",
  "next.js mdx.js blog",
  "nuxt.js mdx content management",
  "headless cms with webhooks",
  "best cms for mdx content",
  "nextjs content management system",
  "how to integrate mdx with next.js",
  "nextjs cms",
  "Best CMS for NextJS",
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST!),
  applicationName: "Stubby CMS",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_HOST!,
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Stubby",
    url: process.env.NEXT_PUBLIC_HOST!,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST!}/og.webp`,
        width: 1200,
        height: 630,
        alt: "Stubby CMS: Simplest headless CMS for your content",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="scroll-pt-28">
      <body
        className={clsx(
          inter.variable,
          "min-h-screen bg-background font-sans",
          mono.variable,
          heading.variable,
          headingBold.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
