import { SchemaField } from "@/app/dashboard/[siteId]/schema/state";
import { getFrontMatterStartAndEnd } from "@/lib/frontmatter";
import { slugify } from "@/lib/utils";
import { type Monaco } from "@monaco-editor/react";
import { snippets, snippetsOrder } from "./snippets";

export const registerAutoCompleteSuggestions = (monaco: Monaco) => {
  return monaco.languages.registerCompletionItemProvider("mdx", {
    triggerCharacters: ["/"],

    provideCompletionItems: (model, position) => {
      // Get the current line content up to the cursor position
      const lineContent = model.getLineContent(position.lineNumber);
      const prefix = lineContent.substring(0, position.column - 1).trim();

      const { start, end } = getFrontMatterStartAndEnd(model.getValue());

      const positionOffset = model.getOffsetAt(position);

      if (positionOffset >= start && positionOffset <= end) {
        return { suggestions: [] };
      }

      // Only provide suggestions if the prefix ends with '/'
      if (!prefix.endsWith("/")) {
        return { suggestions: [] };
      }

      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - 1, // Start from the '/' character
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };

      const suggestions = snippetsOrder.map((snippetKey, index) => {
        const snippet = snippets[snippetKey];
        const label = snippet.label;

        return {
          label: label,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          filterText: `/${snippet.label}`,
          insertText: snippet.insetText,
          documentation: {
            value: snippet.documentation,
          },
          detail: snippet.detail,
          sortText: index.toString().padStart(2, "0"),
        };
      });

      return { suggestions };
    },
  });
};

export const createFrontMatterContextKey = (monaco: Monaco) => {
  return monaco.languages.register({ id: "frontmatter" });
};

function generateFieldDocs(field: SchemaField): string {
  if (!field.validations) return "";

  const validationRules = field.validations
    .map((v: any) => `- ${v.type}: ${v.value}`)
    .join("\n");

  return [
    `Type: ${field.type}`,
    `Required: ${field.required}`,
    validationRules ? `\nValidations:\n${validationRules}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function getValueSuggestions(field: SchemaField, monaco: Monaco, range: any) {
  switch (field.type) {
    case "string":
      if (field.validations?.some((v: any) => v.type === "url")) {
        return [
          {
            label: "https://",
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: "https://",
            range,
          },
        ];
      }
      return [];

    case "boolean":
      return ["true", "false"].map((value) => ({
        label: value,
        kind: monaco.languages.CompletionItemKind.Value,
        insertText: value,
        range,
      }));

    default:
      return [];
  }
}

function getParentField(
  model: any,
  position: any,
  schema: SchemaField[],
): SchemaField | null {
  // Walk up lines until we find parent field
  let lineNumber = position.lineNumber;
  while (lineNumber > 1) {
    const line = model.getLineContent(--lineNumber);
    const match = line.match(/^(\w+):/);
    if (match) {
      return schema.find((f) => f.key === match[1]) || null;
    }
  }
  return null;
}

function getArrayItemSuggestions(
  field: SchemaField,
  monaco: Monaco,
  range: any,
) {
  return [
    {
      label: "New Item",
      kind: monaco.languages.CompletionItemKind.Value,
      insertText: "- ${1:item}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    },
  ];
}

function getDefaultValue(field: SchemaField, titleContent: string): string {
  if (field.key === "slug") {
    return titleContent ? slugify(titleContent) : "";
  }

  switch (field.type) {
    case "string":
      return field.validations?.some((v: any) => v.type === "url")
        ? "https://"
        : "";
    case "number":
      return "0";
    case "boolean":
      return "true";
    case "date":
      return new Date().toISOString();
    default:
      return "";
  }
}

function getInsertTextForField(
  field: SchemaField,
  titleContent: string,
): string {
  switch (field.type) {
    case "array":
      return `${field.key}:\n  - \${1:item}`;
    case "object":
      return `${field.key}:\n  \${1:property}: \${2:value}`;
    default:
      return `${field.key}: \${1:${getDefaultValue(field, titleContent)}}`;
  }
}

export const registerFrontMatterSuggestions = (
  monaco: Monaco,
  schema: SchemaField[],
) => {
  return monaco.languages.registerCompletionItemProvider("mdx", {
    triggerCharacters: ["\n", "-", " "],

    provideCompletionItems: (model, position) => {
      const content = model.getValue();

      const { start, end } = getFrontMatterStartAndEnd(content);

      // Extract title from frontmatter to use as default value for slug
      const frontmatter = content.substring(start, end).split("\n");
      const titlePosition = frontmatter.findIndex((line) =>
        line.trim().startsWith("title:"),
      );
      const titleContent = frontmatter[titlePosition]
        .replace("title:", "")
        .trim();

      const offset = model.getOffsetAt(position);

      if (offset < start || offset > end) {
        return { suggestions: [] };
      }

      const lineContent = model.getLineContent(position.lineNumber);
      const currentIndentation = lineContent.match(/^\s*/)?.[0].length || 0;
      const isStartOfLine = lineContent.trim().length === 0;
      const prevLineContent =
        position.lineNumber > 1
          ? model.getLineContent(position.lineNumber - 1)
          : "";

      // Get used top-level fields
      const usedFields = new Set(
        content
          .split("\n")
          .map((line) => line.match(/^(\w+):/)?.[1])
          .filter(Boolean),
      );

      const range = {
        startLineNumber: position.lineNumber,
        startColumn: currentIndentation + 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };

      // Handle array item suggestions
      if (prevLineContent.trim().startsWith("-")) {
        const parentField = getParentField(model, position, schema);
        if (parentField?.type === "array") {
          return {
            suggestions: getArrayItemSuggestions(parentField, monaco, range),
          };
        }
      }

      // Suggest fields only at start of line with no indentation
      if (isStartOfLine && currentIndentation === 0) {
        const availableFields = schema.filter(
          (field) => !usedFields.has(field.key),
        );

        return {
          suggestions: availableFields.map((field) => ({
            label: field.key,
            kind: monaco.languages.CompletionItemKind.Field,
            documentation: {
              value: generateFieldDocs(field),
            },
            insertText: getInsertTextForField(field, titleContent),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: `(${field.type})${field.required ? " required" : ""}`,
            sortText: field.required ? "0" + field.key : "1" + field.key,
            range,
          })),
        };
      }

      // Value suggestions after colon
      if (lineContent.includes(":")) {
        const fieldKey = lineContent.split(":")[0].trim();
        const field = schema.find((f) => f.key === fieldKey);
        if (field) {
          return {
            suggestions: getValueSuggestions(field, monaco, range),
          };
        }
      }

      return { suggestions: [] };
    },
  });
};
