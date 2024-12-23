import { editor, IDisposable, languages } from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { Issue } from "./lint.worker";

export class Markers {
  _monaco: Monaco | undefined;
  _editor: editor.IStandaloneCodeEditor | undefined;

  constructor(
    monaco: Monaco | null,
    mEditor: editor.IStandaloneCodeEditor | null,
  ) {
    if (!monaco || !mEditor) return;

    this._monaco = monaco;
    this._editor = mEditor;
  }

  dispose() {}
}

export const makeAndApplySpellCheckMarkers = (
  errors: [],
  monacoEditor: Monaco | null,
  model: editor.ITextModel | null | undefined,
) => {
  if (!model || !monacoEditor) return;
  monacoEditor.editor.removeAllMarkers("spell-check");

  if (!errors || errors.length === 0) return;
  const markers: editor.IMarkerData[] = [];
  errors.forEach((error: any) => {
    const startLineNumber = model.getPositionAt(error.start).lineNumber;
    const startColumn = model.getPositionAt(error.start).column;
    const endLineNumber = model.getPositionAt(error.end).lineNumber;
    const endColumn = model.getPositionAt(error.end).column;

    markers.push({
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: error.message,
      severity: monacoEditor.MarkerSeverity.Info,
    });
  });
  monacoEditor.editor.setModelMarkers(model, "spell-check", markers);
};

export const makeAndApplyFrontMatterMarkers = (
  errors: [],
  monacoEditor: Monaco | null,
  model: editor.ITextModel | null | undefined,
) => {
  if (!model || !monacoEditor) return;
  monacoEditor.editor.removeAllMarkers("front-matter-check");
  if (!errors || errors.length === 0) return;

  const markers: editor.IMarkerData[] = [];

  errors.forEach((error: any) => {
    const startLineNumber = model.getPositionAt(error.start).lineNumber;
    const startColumn = model.getPositionAt(error.start).column;
    const endLineNumber = model.getPositionAt(error.end).lineNumber;
    const endColumn = model.getPositionAt(error.end).column;

    markers.push({
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: error.message,
      severity: monacoEditor.MarkerSeverity.Error,
    });
  });

  monacoEditor.editor.setModelMarkers(model, "front-matter-check", markers);
};

let frontMatterCodeActionsDispose: IDisposable | null = null;

const generateFrontMatterQuickFixes = (
  error: any,
  model: editor.ITextModel,
) => {
  const fixes = [];

  if (error.message.includes("missing")) {
    // Example fix for missing fields
    const position = model.getPositionAt(error.start);
    const fixText = `\n${error.path.join(".")}: <provide_default_value>`;
    fixes.push({
      title: `Add missing field: ${error.path.join(".")}`,
      edit: {
        edits: [
          {
            resource: model.uri,
            edit: {
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
              text: fixText,
            },
          },
        ],
      },
      kind: "quickfix",
    });
  }

  // Add other fixes for different error types
  return fixes;
};

export const makeAndApplyCodeActionsForFrontMatter = (
  errors: [],
  monacoEditor: Monaco | null,
) => {
  if (!monacoEditor) return;

  if (frontMatterCodeActionsDispose) {
    frontMatterCodeActionsDispose.dispose();
  }

  frontMatterCodeActionsDispose =
    monacoEditor.languages.registerCodeActionProvider("mdx", {
      provideCodeActions: (model, range, context, token) => {
        const fixes: any = [];

        context.markers.forEach((marker) => {
          fixes.push(...generateFrontMatterQuickFixes(marker, model));
        });

        return {
          actions: fixes,
          dispose: () => {},
        };
      },
    });
};

let codeActionsDispose: IDisposable | null = null;

export const makeApplyCodeActionsForSpellCheck = (
  errors: [],
  monacoEditor: Monaco | null,
) => {
  if (!monacoEditor) return;

  if (codeActionsDispose) {
    codeActionsDispose.dispose();
  }

  codeActionsDispose = monacoEditor.languages.registerCodeActionProvider(
    "mdx",
    {
      provideCodeActions: (model, range, context, token) => {
        const actions: languages.CodeAction[] = [];
        context.markers.forEach((marker: any) => {
          let re = /\"(.*)\"/;
          let match = re.exec(marker.message);

          var word = "";
          if (match && match.length >= 2) word = match[1];
          if (word.length == 0) return;
          const issueIndex = errors.findIndex((e: Issue) => e.source === word);

          if (issueIndex < 0) return;
          const issue: Issue = errors[issueIndex];

          if (issue != undefined && (issue as Issue).suggestions.length > 0) {
            issue.suggestions.forEach((suggestion: any) => {
              actions.push({
                title: suggestion,
                diagnostics: [marker],
                kind: "quickfix",
                edit: {
                  edits: [
                    {
                      resource: model.uri,
                      versionId: model.getVersionId(),
                      textEdit: {
                        range: {
                          startLineNumber: marker.startLineNumber,
                          startColumn: marker.startColumn,
                          endLineNumber: marker.endLineNumber,
                          endColumn: marker.endColumn,
                        },
                        text: suggestion,
                      },
                    },
                  ],
                },
              });
            });
          }
        });

        return {
          actions,
          dispose: () => {},
        };
      },
    },
  );
};
