import { type Monaco } from "@monaco-editor/react";
import { editor as monacoEditor } from "monaco-editor";

export const registerFoldingRangeProvider = (
  editor: monacoEditor.IStandaloneCodeEditor,
  monaco: Monaco,
) => {
  return monaco.languages.registerFoldingRangeProvider("mdx", {
    provideFoldingRanges: (model, context, token) => {
      let ranges = [];
      let lines = model.getValue().split(/\n/);
      let start = 1;
      for (let l = 0; l < lines.length; l++) {
        let line = lines[l];
        if (line.match(/^#+\s+.+/)) {
          // found a heading, split the region
          if (l >= start) {
            ranges.push({
              start,
              end: l,
              kind: monaco.languages.FoldingRangeKind.Region,
            });
          }
          start = l + 1;
        }
      }
      // push last region
      ranges.push({
        start,
        end: lines.length,
        kind: monaco.languages.FoldingRangeKind.Region,
      });
      return ranges;
    },
  });
};
