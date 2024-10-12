import type { Monaco } from "@monaco-editor/react";
import { registerCompletion } from "monacopilot";
import { type editor as editorType } from "monaco-editor";

export const registerAIAutoComplete = (
  editor: editorType.IStandaloneCodeEditor,
  monaco: Monaco,
) => {
  registerCompletion(monaco, editor, {
    endpoint: "/api/complete",
    language: "mdx",
    maxContextLines: 60,
    trigger: "onTyping",
  });
};
