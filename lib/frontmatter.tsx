import yaml from "js-yaml";

export function getFrontMatterStartAndEnd(content: string) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.match(/^---\s*$/));
  if (start === -1) return { start: -1, end: -1 };

  const end = lines
    .slice(start + 1)
    .findIndex((line) => line.match(/^---\s*$/));

  if (end === -1) return { start: -1, end: -1 };

  // Calculate start character position
  const startChar = lines
    .slice(0, start)
    .reduce((acc, line) => acc + line.length + 1, 0); // +1 for newline

  // Calculate end character position
  const endChar = lines
    .slice(0, start + end + 2) // +2 because we want to include the closing ---
    .reduce((acc, line) => acc + line.length + 1, 0);

  return { start: startChar + 4, end: endChar - 4 };
}

export function extractFrontMatterString(mdxOrMarkdownString: string) {
  const lines = mdxOrMarkdownString
    .split(/\r?\n/)
    .map((line) => line.trimEnd());

  const hasFrontMatter =
    lines[0].match(/^---\s*$/) &&
    lines.slice(1).some((line) => line.match(/^---\s*$/));

  if (!hasFrontMatter) {
    return { content: mdxOrMarkdownString, data: {} };
  }

  const endOfFrontMatterIndex =
    lines.slice(1).findIndex((line) => line.match(/^---\s*$/)) + 1;
  const frontMatterRaw = lines.slice(1, endOfFrontMatterIndex).join("\n");
  const content = lines.slice(endOfFrontMatterIndex + 1).join("\n");

  return { frontMatterRaw, content };
}

export function extractFrontMatter(mdxOrMarkdownString: string) {
  if (!mdxOrMarkdownString) return { content: "", data: {} as any };

  const { content, frontMatterRaw } =
    extractFrontMatterString(mdxOrMarkdownString);

  try {
    let data = yaml.load(frontMatterRaw ?? "");
    return { content, data };
  } catch (error) {
    return { content, data: null };
  }
}

export function parseFrontMatter(frontMatterRaw: string) {
  try {
    let data = yaml.load(frontMatterRaw ?? "");
    return data;
  } catch (error) {
    return {};
  }
}

export function removeFrontMatter(content: string) {
  let frontMatter = content.match(/---([\s\S]*?)---/);
  if (frontMatter) {
    return content.replace(frontMatter[0], "");
  }
  return content;
}
