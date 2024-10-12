import type { editor as e } from "monaco-editor";
import { onDropFile } from "./on-drop-file";
import type { Monaco } from "@monaco-editor/react";

export const pasteHandler = (
  event: any,
  editor: e.IStandaloneCodeEditor | null,
  monaco: Monaco | null,
  siteId: string,
) => {
  if (!editor || !monaco) return;
  if (!event.clipboardData) return;

  if (editor.hasTextFocus()) {
    let clipboardData = event.clipboardData;
    if (clipboardData.files && clipboardData.files.length) {
      event.preventDefault();
      editor.trigger(null, "undo", null);
      onDropFile(clipboardData.files[0], editor, monaco, siteId);
    }
  }
};
