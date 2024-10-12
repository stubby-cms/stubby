import { editor, Position } from "monaco-editor/esm/vs/editor/editor.api";
import type { Monaco } from "@monaco-editor/react";
import {
  getLanguageService,
  Position as HtmlPosition,
  TextDocument,
  Range as HtmlRange,
  TextEdit,
} from "vscode-html-languageservice";

export const getSelectedText = (
  editor: editor.IStandaloneCodeEditor | null,
) => {
  if (editor === null) return;
  const selection = editor.getSelection();
  if (!selection) return;
  return editor.getModel()?.getValueInRange(selection);
};

export function insertHintAtCursor(
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco | null,
  hint: string,
) {
  if (editor === null) return;

  const selection = editor.getSelection();

  if (!selection || monaco === null) {
    return;
  }

  const disposer = monaco.languages.registerInlayHintsProvider("mdx", {
    provideInlayHints(model, range, token) {
      return {
        hints: [
          {
            kind: monaco.languages.InlayHintKind.Type,
            position: {
              column: selection?.startColumn,
              lineNumber: selection?.startLineNumber,
            },
            label: hint,
          },
        ],
        dispose: () => {},
      };
    },
  });

  return disposer;
}

export function insertTextAtCursor(
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco | null,
  text: string,
) {
  const selection = editor.getSelection();

  if (!selection || monaco === null) {
    return;
  }

  const range = new monaco.Range(
    selection.startLineNumber,
    selection.startColumn,
    selection.endLineNumber,
    selection.endColumn,
  );

  editor.executeEdits("", [
    { range: range, text: text, forceMoveMarkers: true },
  ]);

  const endPosition = editor.getModel()!.getPositionAt(
    editor.getModel()!.getOffsetAt({
      lineNumber: range.startLineNumber,
      column: range.startColumn,
    }) + text.length,
  );

  editor.setPosition(endPosition);
}

export function getHtmlService() {
  return getLanguageService();
}

export function modelToDocument(model: editor.IModel) {
  return TextDocument.create(
    model.uri.toString(),
    model.getLanguageId(),
    model.getVersionId(),
    model.getValue(),
  );
}

export function toLsPosition(position: Position): HtmlPosition {
  return {
    character: position.column - 1,
    line: position.lineNumber - 1,
  };
}
