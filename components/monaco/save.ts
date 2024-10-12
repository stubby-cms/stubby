import { Monaco } from "@monaco-editor/react";
import type { editor as editorType } from "monaco-editor";

export const registerSaveAction = (
  editor: editorType.IStandaloneCodeEditor,
  monaco: Monaco,
  save: () => void,
) => {
  const actionDisposer = editor.addAction({
    id: "save",
    label: "Save",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run: save,
  });

  return actionDisposer;
};
