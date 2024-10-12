import {
  getSelectedText,
  insertHintAtCursor,
  insertTextAtCursor,
} from "./utils";
import { uploadFile } from "@/lib/upload";
import { type editor as editorType } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";

export const onDropFile = async (
  file: any,
  editor: editorType.IStandaloneCodeEditor | null,
  monaco: Monaco | null,
  siteId: string,
) => {
  try {
    if (!editor || !file || !monaco) return;

    const disposer = insertHintAtCursor(editor, monaco, "Uploading...");

    let { url, success } = await uploadFile(file, siteId);

    disposer?.dispose();

    if (file.name.match(/\.(mp4|mov|webm)$/)) {
      insertTextAtCursor(editor, monaco, `@video { ${url} }`);
    } else {
      let selText = getSelectedText(editor);
      let altText = selText || "Alt text";
      let m;

      if ((m = selText?.match(/\!\[(.*?)\]/))) {
        altText = m[1];
      }

      insertTextAtCursor(editor, monaco, `![${altText}](${url})`);
    }
  } catch (error) {
    console.error(error);
  }
};
