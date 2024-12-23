import { dbContent$ } from "@/app/dashboard/state";
import { observer } from "@legendapp/state/react";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";

export const PageDbPreview = observer(() => {
  const data = dbContent$.get();
  const theme = useTheme();

  return (
    <>
      <Editor
        defaultLanguage="json"
        value={JSON.stringify(data, null, 2)}
        theme={theme.theme === "dark" ? "vs-dark" : "vs-light"}
        options={{
          readOnly: true,
          fontSize: 13,
          lineHeight: 16,
          fontFamily: "var(--font-mono)",
          minimap: {
            enabled: false,
          },
          scrollBeyondLastLine: false,
          scrollBeyondLastColumn: 10,
          scrollbar: {
            useShadows: false,
            verticalScrollbarSize: 8,
            scrollByPage: true,
            horizontalScrollbarSize: 8,
          },
          padding: {
            top: 16,
            bottom: 16,
          },
          contextmenu: false,
          renderLineHighlight: "all",
          renderLineHighlightOnlyWhenFocus: true,
          lineNumbers: "off",
          selectionHighlight: false,
          foldingHighlight: false,
          occurrencesHighlight: "off",
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
        }}
      />
    </>
  );
});
