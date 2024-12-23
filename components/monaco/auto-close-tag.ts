import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import type { Monaco } from "@monaco-editor/react";
import { getHtmlService, modelToDocument, toLsPosition } from "./utils";

/**
 * Auto close tag when user types `>`
 * @param editorInstance
 * @param monaco
 * @param event
 */
export function autoCloseTag(
  editorInstance: editor.IStandaloneCodeEditor | null,
  monaco: Monaco | null,
  event: editor.IModelContentChangedEvent,
) {
  if (!editorInstance || !monaco) return;
  let model = editorInstance.getModel();
  if (event.isRedoing || event.isUndoing || event.changes.length != 1) return;

  const change = event.changes[0];

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

    editorInstance.executeEdits(
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
