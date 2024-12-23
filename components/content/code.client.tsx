"use client";

import type { JSX } from "react";
import type { BundledLanguage } from "shiki/bundle/web";
import { Components, toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, useLayoutEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import React from "react";

const highlight = async (code: string, lang: BundledLanguage) => {
  const codeToHast = await import("shiki/bundle/web").then(
    (mod) => mod.codeToHast,
  );

  const out = await codeToHast(code, {
    lang,
    themes: {
      dark: "material-theme-ocean",
      light: "min-light",
    },
  });

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs,
    components: {
      pre: (props: any) => (
        <pre {...props} className="code-block rounded-xl border" />
      ),
    } as Components,
  }) as JSX.Element;
};

function CodeBlockClient({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  const [nodes, setNodes] = useState(<></>);

  let lang = "md" as BundledLanguage;

  if (className && className.startsWith("lang-")) {
    lang = className.replace("lang-", "") as BundledLanguage;
  }

  useLayoutEffect(() => {
    void highlight(children ?? "", lang).then(setNodes);
  }, [children, lang]);

  return nodes ?? <div>Loading...</div>;
}

export const PreBlockClient = ({
  children,
  ...rest
}: {
  children: any;
  [key: string]: any;
}) => {
  if ("type" in children && children["type"] === "code") {
    return CodeBlockClient(children["props"]);
  }
  return <pre {...rest}>{children}</pre>;
};
