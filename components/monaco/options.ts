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
  // tabCompletion: "onlySnippets",
  scrollBeyondLastLine: false,
  scrollBeyondLastColumn: 20,
  padding: {
    top: 58,
    bottom: 200,
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
    verticalScrollbarSize: 5,
  },
  glyphMargin: false,
  lineNumbers: "off",
  cursorBlinking: "smooth",
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 0,
  autoClosingBrackets: "never",
  tabSize: 2,
  hover: {
    enabled: true,
    hidingDelay: 1000,
    sticky: true,
  },
  suggest: {
    showWords: false,
  },
  fixedOverflowWidgets: true,
  lightbulb: {
    enabled: "off",
  },
  contextmenu: false,
} as editor.IStandaloneEditorConstructionOptions;
