export const defaultPageContent = `---
title: Title of the page
description: Description of the page
---

## Hello World
This is a sample post.

## Markdown
Markdown is supported.

`;

export const defaultPageContentOutput = {
  code: 'import { useMDXComponents as _provideComponents } from "@mdx-js/react";\nfunction _createMdxContent(props) {\n    const _components = Object.assign({\n        h2: "h2",\n        a: "a",\n        p: "p"\n    }, _provideComponents(), props.components);\n    return <><_components.h2 id="hello-world">{"Hello World"}<_components.a className="header-anchor" aria-hidden="true" href="#hello-world">{"#"}</_components.a></_components.h2>{"\\n"}<_components.p>{"This is a sample post."}</_components.p>{"\\n"}<_components.h2 id="markdown">{"Markdown"}<_components.a className="header-anchor" aria-hidden="true" href="#markdown">{"#"}</_components.a></_components.h2>{"\\n"}<_components.p>{"Markdown is supported."}</_components.p></>;\n}\nfunction MDXContent(props = {}) {\n    const { wrapper: MDXLayout } = Object.assign({}, _provideComponents(), props.components);\n    return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props}/></MDXLayout> : _createMdxContent(props);\n}\nexport default MDXContent;\n',
  links: ["#hello-world", "#markdown"],
  html: '<h2 id="hello-world">Hello World<a aria-hidden="true" href="#hello-world">#</a></h2>\n<p>This is a sample post.</p>\n<h2 id="markdown">Markdown<a aria-hidden="true" href="#markdown">#</a></h2>\n<p>Markdown is supported.</p>',
  title: "",
  toc: [
    {
      text: "Hello World",
      id: "hello-world",
      depth: 2,
    },
    {
      text: "Markdown",
      id: "markdown",
      depth: 2,
    },
  ],
  frontmatter: {
    title: "Title of the page",
    description: "Description of the page",
  },
};
