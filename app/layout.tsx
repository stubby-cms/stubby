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
  weight: "700",
  preload: true,
  variable: "--font-brand",
});

const headingBold = Figtree({
  subsets: ["latin"],
  weight: "600",
  preload: true,
  variable: "--font-brand-semibold",
});

const title = "Stubby: Simplest headless CMS for your content";

const description =
  "Write and manage MDX content in the cloud with Stubby CMS. Integrate with your favorite frameworks for seamless website publishing. Effortlessly create and deploy dynamic content across multiple sites.";

const keywords = [
  "nextjs cms",
  "mdx based cms",
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
  "nextjs markdown",
  "Best CMS for NextJS",
];

export const metadata: Metadata = {
  title,
  description,
  keywords,
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST!),
  applicationName: "Stubby CMS",
  openGraph: {
    title,
    description,
    type: "website",
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
          "min-h-screen bg-background font-sans antialiased",
          mono.variable,
          heading.variable,
          headingBold.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
