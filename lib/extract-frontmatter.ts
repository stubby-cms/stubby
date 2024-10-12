import yaml from "js-yaml";

export function extractFrontMatter(mdxOrMarkdownString: string) {
  if (!mdxOrMarkdownString) return { content: "", data: {} as any };

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

  try {
    let data = yaml.load(frontMatterRaw);
    return { content, data };
  } catch (error) {
    return { content, data: null };
  }
}
