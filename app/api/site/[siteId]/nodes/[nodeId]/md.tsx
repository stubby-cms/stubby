import Markdown, { compiler } from "markdown-to-jsx";
import { components } from "@/components/admin/components";
import { createElement } from "react";
import { slugify } from "@/lib/utils";

export const getToc = (source: string) => {
  const headings: any = [];
  compiler(source, {
    createElement(type, props: any, children: any) {
      if (type === "h1" || type === "h2" || type === "h3" || type === "h4") {
        headings.push({ id: props.id, text: children[0], level: type });
      }
      return createElement(type, props, children);
    },
  });

  return headings;
};

export function MdPreview(md: string) {
  return (
    <Markdown
      options={{
        overrides: components,
        slugify: (str) => {
          return slugify(str);
        },
      }}
    >
      {md}
    </Markdown>
  );
}
