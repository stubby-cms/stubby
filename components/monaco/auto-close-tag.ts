import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import type { Monaco } from "@monaco-editor/react";
import { getHtmlService, modelToDocument, toLsPosition } from "./utils";

export function autoCloseTag(
  ed: editor.IStandaloneCodeEditor | null,
  monaco: Monaco | null,
  e: editor.IModelContentChangedEvent,
) {
  if (!ed || !monaco) return;
  let model = ed.getModel();
  if (e.isRedoing || e.isUndoing || e.changes.length != 1) return;

  const change = e.changes[0];

  if (change.text == ">") {
    let document = modelToDocument(model!);
    const position = new monaco.Position(
      change.range.endLineNumber,
      change.range.endColumn + 1,
    );
    const htmlService = getHtmlService();
    let close = htmlService.doTagComplete(
      document,
      toLsPosition(position),
      htmlService.parseHTMLDocument(document),
    );

    if (!close?.startsWith("$0")) return;

    ed.executeEdits(
      null,
      [
        {
          text: close.substring(2)!,
          range: new monaco.Range(
            change.range.endLineNumber,
            change.range.endColumn + 1,
            change.range.endLineNumber,
            change.range.endColumn + 1,
          ),
        },
      ],
      [
        new monaco.Selection(
          change.range.endLineNumber,
          change.range.endColumn + 1,
          change.range.endLineNumber,
          change.range.endColumn + 1,
        ),
      ],
    );
  }
}
