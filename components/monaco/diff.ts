import { editor } from "monaco-editor";
import { DiffComputer, IChange, IDiffComputerOpts } from "vscode-diff";

enum ChangeType {
  Modify,
  Add,
  Delete,
}

function getChangeType(change: IChange): ChangeType {
  if (change.originalEndLineNumber === 0) {
    return ChangeType.Add;
  } else if (change.modifiedEndLineNumber === 0) {
    return ChangeType.Delete;
  } else {
    return ChangeType.Modify;
  }
}

export const updateDiffDecorations = (
  editor: editor.IStandaloneCodeEditor | null,
  diffAgainst: string,
  decorationsCollection: editor.IEditorDecorationsCollection,
) => {
  if (!diffAgainst || !editor) return;

  const a = diffAgainst.split(/\r\n|\n|\r/);
  const b = editor.getValue().split(/\r\n|\n|\r/);

  let options: IDiffComputerOpts = {
    shouldPostProcessCharChanges: false,
    shouldIgnoreTrimWhitespace: false,
    shouldMakePrettyDiff: false,
    shouldComputeCharChanges: false,
    maxComputationTime: 0,
  };

  let diffComputer = new DiffComputer(a, b, options);
  let result = diffComputer.computeDiff();
  const decorations: editor.IModelDeltaDecoration[] = [];

  result.changes.forEach((change) => {
    let changeType = getChangeType(change);

    const startLineNumber = change.modifiedStartLineNumber;
    const endLineNumber = change.modifiedEndLineNumber || startLineNumber;

    switch (changeType) {
      case ChangeType.Add:
        decorations.push({
          range: {
            startLineNumber,
            startColumn: 1,
            endLineNumber: endLineNumber,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            linesDecorationsClassName: "line-decoration-added",
          },
        });
        break;
      case ChangeType.Delete:
        decorations.push({
          range: {
            startLineNumber: startLineNumber,
            startColumn: Number.MAX_VALUE,
            endLineNumber: startLineNumber,
            endColumn: Number.MAX_VALUE,
          },
          options: {
            isWholeLine: false,
            linesDecorationsClassName: "line-decoration-removed next-line",
          },
        });
        break;
      case ChangeType.Modify:
        decorations.push({
          range: {
            startLineNumber: startLineNumber,
            startColumn: 1,
            endLineNumber: endLineNumber,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            linesDecorationsClassName: "line-decoration-changed",
          },
        });
    }
  });

  if (decorationsCollection) {
    decorationsCollection.set(decorations);
  }
};
