// import init, { clean_mdx_content, lint } from "../../../harper/harper-wasm/pkg";

import { extractFrontMatterString } from "@/lib/frontmatter";
import { Schema } from "@prisma/client";
import init, { clean_mdx_content, lint } from "mdx-lint";
import { z } from "zod";
import { validateFrontmatter } from "./validate-frontmatter";

export interface Issue {
  start: number;
  end: number;
  message: string;
  source: string;
  suggestions: string[];
  kind: string;
}

const spellCheck = (value: string | undefined) => {
  if (!value) return;
  const cleanText = clean_mdx_content(value);
  const output = lint(cleanText);
  const issues: Issue[] = [];

  output.forEach((lint, index) => {
    if (lint.suggestion_count() > 0) {
      const span = lint.span();

      issues.push({
        start: span.start,
        end: span.end,
        message: lint.message(),
        source: lint.get_problem_text(),
        suggestions: lint
          .suggestions()
          .map((suggestion) => suggestion.get_replacement_text()),
        kind: lint.lint_kind(),
      });
    }
  });

  return issues;
};

function formatZodPath(path: (string | number)[]): string {
  if (!path.length) return "";

  return path
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : segment))
    .join(".")
    .replace(/\.\[/g, "[");
}

const getReadableZodMessage = (error: z.ZodIssue): string => {
  const path = formatZodPath(error.path);
  const prefix = path ? `${path}: ` : "";

  switch (error.code) {
    case "invalid_type":
      return `${prefix}Expected ${error.expected}, but received ${error.received}`;

    case "invalid_string":
      if (error.validation === "url") return `${prefix}Must be a valid URL`;
      if (error.validation === "email")
        return `${prefix}Must be a valid email address`;
      return `${prefix}${error.message}`;

    case "invalid_date":
      return `${prefix}Must be a valid date`;

    case "too_small":
      const what = error.type === "string" ? "characters" : "items";
      return `${prefix}Must contain at least ${error.minimum} ${what}`;

    case "too_big":
      const whatBig = error.type === "string" ? "characters" : "items";
      return `${prefix}Must contain at most ${error.maximum} ${whatBig}`;

    case "invalid_enum_value":
      return `${prefix}Must be one of: ${error.options.join(", ")}`;

    default:
      return `${prefix}${error.message}`;
  }
};

const frontMatterCheck = async (
  frontMatterRaw: string | undefined,
  schema: Schema,
) => {
  if (!frontMatterRaw) return;

  const errors: z.ZodIssue[] = await validateFrontmatter(
    frontMatterRaw,
    schema,
  );

  const issues = errors.map((error) => {
    return {
      start: 4,
      end: frontMatterRaw.length + 4,
      message: getReadableZodMessage(error),
      source: "frontmatter",
      suggestions: [],
      kind: "error",
    };
  });

  return issues;
};

let cachedFrontMatter = "";

self.addEventListener("message", async (event) => {
  switch (event.data.type) {
    case "init":
      try {
        await init();
        self.postMessage({ type: "loaded" });
      } catch (error) {}
      break;
    case "lint":
      const { value, schema } = event.data;

      // Spell check linting
      const errors = spellCheck(value);
      self.postMessage({ type: "lint", errors });

      // Frontmatter linting
      const { frontMatterRaw } = extractFrontMatterString(value);
      if (cachedFrontMatter === frontMatterRaw) return;

      const frontMatterErrors = await frontMatterCheck(frontMatterRaw, schema);
      self.postMessage({ type: "frontmatter-lint", errors: frontMatterErrors });
      cachedFrontMatter = frontMatterRaw ?? "";

      break;
  }
});
