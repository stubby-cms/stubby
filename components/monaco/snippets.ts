export const snippetsOrder = [
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "bold",
  "italic",
  "quote",
  "code",
  "image",
  "link",
  "table",
  "hr",
  "list",
  "numberedList",
  "taskList",
  "info",
  "warning",
  "tip",
  "note",
];

export const snippets: Record<
  string,
  {
    label: string;
    insetText: string;
    documentation: string;
    detail?: string;
  }
> = {
  h2: {
    label: "Heading 2",
    insetText: "## ${1:Heading 2}\n",
    documentation: "Create a level 2 heading",
    detail: "## Heading 2",
  },
  h3: {
    label: "Heading 3",
    insetText: "### ${1:Heading 3}\n",
    documentation: "Create a level 3 heading",
    detail: "### Heading 3",
  },
  h4: {
    label: "Heading 4",
    insetText: "#### ${1:Heading 4}\n",
    documentation: "Create a level 4 heading",
    detail: "#### Heading 4",
  },
  h5: {
    label: "Heading 5",
    insetText: "##### ${1:Heading 5}\n",
    documentation: "Create a level 5 heading",
    detail: "##### Heading 5",
  },
  h6: {
    label: "Heading 6",
    insetText: "###### ${1:Heading 6}\n",
    documentation: "Create a level 6 heading",
    detail: "###### Heading 6",
  },
  bold: {
    label: "Bold",
    insetText: "**${1:bold text}** ",
    documentation: "Make text bold",
    detail: "**Bold text**",
  },
  italic: {
    label: "Italic",
    insetText: "*${1:italic text}*  ",
    documentation: "Italicize text",
    detail: "*Italic text*",
  },
  link: {
    label: "Link",
    insetText: "[${1:text}](${2:url})",
    documentation: "Create a hyperlink",
    detail: "[Link text](https://example.com)",
  },
  code: {
    label: "Code block",
    insetText: "```${1:language}\n${2:code}\n```\n",
    documentation: "Insert a code block",
    detail: "```lang\n```",
  },
  quote: {
    label: "Quote",
    insetText: "> ${1:Highlight a key takeaway.}\n",
    documentation: "Insert a quote",
    detail: "> Quote here",
  },
  list: {
    label: "List",
    insetText: "- ${1:List item 1}",
    documentation: "Create a bullet list",
    detail: "- List item 1",
  },
  numberedList: {
    label: "Numbered list",
    insetText: "1. ${1:List item 1}",
    documentation: "Create a numbered list",
    detail: "1. List item 1",
  },
  taskList: {
    label: "Task list",
    insetText: "- [ ] ${1:Task 1}",
    documentation: "Create a task list",
    detail: "- [ ] Task 1",
  },
  table: {
    label: "Table",
    insetText:
      `
| \${1:Column 1} | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Text     | Text     | Text     |`.trim() + "\n",
    documentation: "Insert a table",
    detail: "table",
  },
  image: {
    label: "Image",
    insetText: "![${1:description you image}](${2:url})",
    documentation: "Insert an image",
    detail: "![Image description](url)",
  },
  hr: {
    label: "Horizontal rule",
    insetText: "---",
    documentation: "Insert a horizontal rule",
    detail: "---",
  },
  info: {
    label: "Info",
    insetText: "<Info>\n\t${1:Key information here}\n</Info>\n",
    documentation: "Insert an info block",
  },
  warning: {
    label: "Warning",
    insetText: "<Warning>\n\t${1:Describe the warning}\n</Warning>\n",
    documentation: "Insert a warning block",
  },
  tip: {
    label: "Tip",
    insetText: "<Tip>\n\t${1:Share a helpful tip}\n</Tip>\n",
    documentation: "Insert a tip block",
  },
  note: {
    label: "Note",
    insetText: "<Note>\n\t${1:Add your note here}\n</Note>\n",
    documentation: "Insert a note block",
  },
};
