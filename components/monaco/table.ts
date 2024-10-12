"use client";

import { Monaco } from "@monaco-editor/react";
import {
  TableEditor,
  ITextEditor,
  options,
  Point,
  Range,
  // @ts-ignore
} from "@susisu/mte-kernel";
import { editor } from "monaco-editor";

export default class TextEditorInterface extends ITextEditor {
  private textEditor: editor.IStandaloneCodeEditor;

  constructor(textEditor: editor.IStandaloneCodeEditor) {
    super();
    this.textEditor = textEditor;
  }

  getCursorPosition() {
    const position = this.textEditor.getPosition() || {
      lineNumber: 1,
      column: 1,
    };
    return new Point(position.lineNumber - 1, position.column - 1);
  }

  setCursorPosition(pos: Point) {
    this.textEditor.setPosition({
      lineNumber: pos.row + 1,
      column: pos.column + 1,
    });
  }

  setSelectionRange(range: Range) {
    this.textEditor.setSelection({
      startLineNumber: range.start.row + 1,
      startColumn: range.start.column + 1,
      endLineNumber: range.end.row + 1,
      endColumn: range.end.column + 1,
    });
  }

  getLastRow() {
    const model = this.textEditor.getModel();
    if (!model) {
      return 0;
    }

    return model.getLineCount() - 1;
  }

  acceptsTableEdit(row: number) {
    return true;
  }

  getLine(row: number) {
    const model = this.textEditor.getModel();

    if (!model) {
      return "";
    }

    return model.getLineContent(row + 1);
  }

  insertLine(row: number, line: number) {
    this.textEditor.executeEdits("", [
      {
        range: {
          startLineNumber: row + 1,
          startColumn: 0,
          endLineNumber: row + 1,
          endColumn: 0,
        },
        text: line + "\n",
      },
    ]);
  }

  deleteLine(row: number) {
    this.textEditor.executeEdits("", [
      {
        range: {
          startLineNumber: row + 1,
          startColumn: 0,
          endLineNumber: row + 2,
          endColumn: 0,
        },
        text: "",
      },
    ]);
  }

  replaceLines(startRow: number, endRow: number, lines: string[]) {
    this.textEditor.executeEdits("", [
      {
        range: {
          startLineNumber: startRow + 1,
          startColumn: 0,
          endLineNumber: endRow + 1,
          endColumn: 0,
        },
        text: lines.join("\n") + "\n",
      },
    ]);
  }

  transact(func: () => void): void {
    const model = this.textEditor.getModel();

    if (!model) {
      return;
    }

    model.pushStackElement();
    func();
    model.pushStackElement();
  }

  destroy() {}
}

let tableEditor: TableEditor;

export const registerTableFormatter = (
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
) => {
  const Interface = new TextEditorInterface(editor);
  tableEditor = new TableEditor(Interface);

  const tableFormatAction = editor.addAction({
    id: "table-format",
    label: "Table - Format",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    contextMenuGroupId: "2_modifications",
    contextMenuOrder: 2,
    run: () => {
      if (tableEditor) {
        if (tableEditor.cursorIsInTable(options({}))) {
          tableEditor.format(options({}));
        } else {
          editor.trigger("keyboard", "type", {
            text: "\n",
          });
        }
      }
    },
  });

  const nextCellAction = editor.addAction({
    id: "table-next",
    label: "Table - Jump to Next Cell",
    keybindings: [monaco.KeyCode.Tab],
    contextMenuGroupId: "2_modifications",
    contextMenuOrder: 2.1,

    run: function (_: any) {
      if (tableEditor) {
        if (tableEditor.cursorIsInTable(options({}))) {
          tableEditor.nextCell(options({}));
        } else {
          editor.trigger("keyboard", "type", {
            text: "    ",
          });
        }
      }
    },
  });

  const previousCellAction = editor.addAction({
    id: "table-previous",
    label: "Table - Jump to Previous Cell",
    keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Tab],
    contextMenuGroupId: "2_modifications",
    contextMenuOrder: 2.2,

    run: function (_: any) {
      if (tableEditor) {
        if (tableEditor.cursorIsInTable(options({}))) {
          tableEditor.previousCell(options({}));
        }
      }
    },
  });

  const addRowAction = editor.addAction({
    id: "table-row",
    label: "Table - Add Row/Line",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
    contextMenuGroupId: "2_modifications",
    contextMenuOrder: 2.3,

    run: function (_: any) {
      if (tableEditor) {
        if (tableEditor.cursorIsInTable(options({}))) {
          tableEditor.insertRow(options({}));
        }
      }
    },
  });

  return [tableFormatAction, nextCellAction, previousCellAction, addRowAction];
};
