import { editor } from "monaco-editor";

export const editorOptions = {
  fontSize: 14,
  lineHeight: 22,
  fontFamily: "var(--font-mono)",
  minimap: {
    enabled: false,
  },
  wordWrap: "bounded",
  wordBasedSuggestions: "off",
  wordWrapColumn: 80,
  wrappingIndent: "same",
  tabCompletion: "onlySnippets",
  scrollBeyondLastLine: false,
  scrollBeyondLastColumn: 10,
  padding: {
    top: 10,
    bottom: 50,
  },
  unicodeHighlight: {
    invisibleCharacters: true,
  },
  guides: {
    highlightActiveIndentation: "always",
  },
  renderLineHighlight: "all",
  renderLineHighlightOnlyWhenFocus: true,
  pasteAs: {
    enabled: false,
    showPasteSelector: "never",
  },
  overviewRulerLanes: 0,
  scrollbar: {
    useShadows: false,
    verticalScrollbarSize: 8,
  },
  glyphMargin: false,
  lineNumbers: "off",
  cursorBlinking: "smooth",
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 0,
  autoClosingBrackets: "never",
} as editor.IStandaloneEditorConstructionOptions;
