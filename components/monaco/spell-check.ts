import { Monaco } from "@monaco-editor/react";
import type { Lint, Span, Suggestion } from "harper-wasm";
import { editor } from "monaco-editor";

export async function lintText(text: string): Promise<Lint[]> {
  const wasm = await import("harper-wasm");

  let lints = wasm.lint(text);

  // We only want to show fixable errors.
  lints = lints.filter((lint) => lint.suggestion_count() > 0);

  return lints;
}

export async function applySuggestion(
  text: string,
  suggestion: Suggestion,
  span: Span,
): Promise<string> {
  const wasm = await import("harper-wasm");

  const applied = wasm.apply_suggestion(text, span, suggestion);
  return applied;
}

export const spellCheck = async (
  value: string,
  monaco: Monaco | null,
  model: editor.ITextModel | null | undefined,
) => {
  if (!monaco || !value.trim()) {
    return;
  }

  const markers: any = [];

  let output = await lintText(value);

  output.forEach((lint, index) => {
    const span = lint.span();

    const startLineNumber = model?.getPositionAt(span.start).lineNumber;
    const startColumn = model?.getPositionAt(span.start).column;
    const endLineNumber = model?.getPositionAt(span.end).lineNumber;
    const endColumn = model?.getPositionAt(span.end).column;

    markers.push({
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: lint.suggestions()[0].get_replacement_text(),
      severity: monaco.MarkerSeverity.Error,
    });
  });

  console.log("markers", markers);

  monaco.editor.setModelMarkers(model!!, "spell-check", markers);

  return;
};
