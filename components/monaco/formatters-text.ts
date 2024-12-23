"use client";

import { type Monaco } from "@monaco-editor/react";
import {
  editor as monacoEditor,
  Position,
  Selection,
  Range,
} from "monaco-editor";

const isWrapped = (
  text: string,
  startPattern: string,
  endPattern: string,
): boolean => {
  return text.startsWith(startPattern) && text.endsWith(endPattern);
};

const getWordContext = (
  editorInstance: monacoEditor.IStandaloneCodeEditor,
  cursorPos: Position,
  startPattern: string,
  endPattern: string,
): string => {
  const model = editorInstance.getModel();
  if (!model) return "";

  let startPositionCharacter = cursorPos.column - startPattern.length;
  let endPositionCharacter = cursorPos.column + endPattern.length;

  if (startPositionCharacter < 0) {
    startPositionCharacter = 0;
  }

  let leftText = model.getValueInRange(
    new Range(
      cursorPos.lineNumber,
      startPositionCharacter,
      cursorPos.lineNumber,
      cursorPos.column,
    ),
  );

  let rightText = model.getValueInRange(
    new Range(
      cursorPos.lineNumber,
      cursorPos.column,
      cursorPos.lineNumber,
      endPositionCharacter,
    ),
  );

  if (rightText == endPattern) {
    if (leftText == startPattern) {
      return `${startPattern}|${endPattern}`;
    } else {
      return `${startPattern}text|${endPattern}`;
    }
  }

  return "|";
};

const wrapRange = (
  editorInstance: monacoEditor.IStandaloneCodeEditor,
  edits: monacoEditor.IIdentifiedSingleEditOperation[],
  shifts: [Position, number][],
  newSelections: Selection[],
  i: number,
  shift: number,
  cursor: Position,
  range: Range,
  isSelected: boolean,
  startPtn: string,
  endPtn: string,
) => {
  const model = editorInstance.getModel();
  if (!model) return;

  const text = model.getValueInRange(range);
  const prevSelection = newSelections[i];
  const ptnLength = (startPtn + endPtn).length;

  let newCursorPos = new Position(cursor.lineNumber, cursor.column + shift);
  let newSelection: Selection;

  if (isWrapped(text, startPtn, endPtn)) {
    edits.push({
      range: range,
      text: text.substring(startPtn.length, text.length - endPtn.length),
    });

    shifts.push([range.getEndPosition(), -ptnLength]);

    if (!isSelected) {
      if (!range.isEmpty()) {
        // Quick styling
        if (cursor.column === range.endColumn) {
          newCursorPos = new Position(
            cursor.lineNumber,
            cursor.column + shift - ptnLength,
          );
        } else {
          newCursorPos = new Position(
            cursor.lineNumber,
            cursor.column + shift - startPtn.length,
          );
        }
      } else {
        debugger;
        // `**|**` -> `|`
        newCursorPos = new Position(
          cursor.lineNumber,
          cursor.column + shift + startPtn.length,
        );
      }
      newSelection = new Selection(
        newCursorPos.lineNumber,
        newCursorPos.column,
        newCursorPos.lineNumber,
        newCursorPos.column,
      );
    } else {
      newSelection = new Selection(
        prevSelection.startLineNumber,
        prevSelection.startColumn + shift,
        prevSelection.endLineNumber,
        prevSelection.endColumn + shift - ptnLength,
      );
    }
  } else {
    edits.push({
      range: range,
      text: startPtn + text + endPtn,
    });

    shifts.push([range.getEndPosition(), ptnLength]);

    if (!isSelected) {
      if (!range.isEmpty()) {
        // Quick styling
        if (cursor.column === range.endColumn) {
          newCursorPos = new Position(
            cursor.lineNumber,
            cursor.column + shift + ptnLength,
          );
        } else {
          newCursorPos = new Position(
            cursor.lineNumber,
            cursor.column + shift + startPtn.length,
          );
        }
      } else {
        // `|` -> `**|**`
        newCursorPos = new Position(
          cursor.lineNumber,
          cursor.column + shift + startPtn.length,
        );
      }
      newSelection = new Selection(
        newCursorPos.lineNumber,
        newCursorPos.column,
        newCursorPos.lineNumber,
        newCursorPos.column,
      );
    } else {
      newSelection = new Selection(
        prevSelection.startLineNumber,
        prevSelection.startColumn + shift,
        prevSelection.endLineNumber,
        prevSelection.endColumn + shift + ptnLength,
      );
    }
  }

  newSelections[i] = newSelection;
};

const styleByWrapping = (
  editorInstance: monacoEditor.IStandaloneCodeEditor,
  startPattern: string,
  endPattern = startPattern,
) => {
  const model = editorInstance.getModel();

  if (!model) return;

  const selections = editorInstance.getSelections() || [];
  let edits: monacoEditor.IIdentifiedSingleEditOperation[] = [];
  let shifts: [Position, number][] = [];
  let newSelections: Selection[] = selections.slice();

  for (const [i, selection] of selections.entries()) {
    let cursorPos = selection.getPosition();

    const shift = shifts
      .map(([pos, s]) =>
        selection.startLineNumber === pos.lineNumber &&
        selection.startColumn >= pos.column
          ? s
          : 0,
      )
      .reduce((a, b) => a + b, 0);

    if (
      selection.startColumn === selection.endColumn &&
      selection.startLineNumber === selection.endLineNumber
    ) {
      const context = getWordContext(
        editorInstance,
        cursorPos,
        startPattern,
        endPattern,
      );

      // No selected text
      if (
        startPattern === endPattern &&
        ["**", "*", "__", "_"].includes(startPattern) &&
        context === `${startPattern}text|${endPattern}`
      ) {
        // `**text|**` to `**text**|`
        let newCursorPos = new Position(
          cursorPos.lineNumber,
          cursorPos.column + shift + endPattern.length,
        );

        newSelections[i] = new Selection(
          newCursorPos.lineNumber,
          newCursorPos.column,
          newCursorPos.lineNumber,
          newCursorPos.column,
        );
        continue;
      } else if (context === `${startPattern}|${endPattern}`) {
        // `**|**` to `|`
        let start = new Position(
          cursorPos.lineNumber,
          cursorPos.column - startPattern.length,
        );

        let end = new Position(
          cursorPos.lineNumber,
          cursorPos.column + endPattern.length,
        );

        wrapRange(
          editorInstance,
          edits,
          shifts,
          newSelections,
          i,
          shift,
          cursorPos,
          new Range(start.lineNumber, start.column, end.lineNumber, end.column),
          false,
          startPattern,
          endPattern,
        );
      } else {
        // Select word under cursor

        const wordAtPosition = model.getWordAtPosition(cursorPos);

        let wordRange = wordAtPosition
          ? new Range(
              cursorPos.lineNumber,
              wordAtPosition.startColumn,
              cursorPos.lineNumber,
              wordAtPosition.endColumn,
            )
          : new Range(
              cursorPos.lineNumber,
              cursorPos.column,
              cursorPos.lineNumber,
              cursorPos.column,
            );

        const lineContent = model.getLineContent(cursorPos.lineNumber);

        if (
          startPattern === "~~" &&
          /^\s*[\*\+\-] (\[[ x]\] )? */g.test(lineContent)
        ) {
          const match = lineContent.match(/^\s*[\*\+\-] (\[[ x]\] )? */g);

          if (match) {
            wordRange = new Range(
              cursorPos.lineNumber,
              match[0].length + 1,
              cursorPos.lineNumber,
              lineContent.length + 1,
            );
          }
        }

        wrapRange(
          editorInstance,
          edits,
          shifts,
          newSelections,
          i,
          shift,
          cursorPos,
          wordRange,
          false,
          startPattern,
          endPattern,
        );
      }
    } else {
      // Text selected
      wrapRange(
        editorInstance,
        edits,
        shifts,
        newSelections,
        i,
        shift,
        cursorPos,
        selection,
        true,
        startPattern,
        endPattern,
      );
    }
  }

  editorInstance.executeEdits("styleByWrapping", edits);
  editorInstance.setSelections(newSelections);
};

export const registerFormatterActions = (
  editor: monacoEditor.IStandaloneCodeEditor,
  monaco: Monaco,
) => {
  const boldAction = editor.addAction({
    id: "bold",
    label: "Bold",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
    run: () => {
      styleByWrapping(editor, "**");
    },
  });

  const underlineAction = editor.addAction({
    id: "strikethrough",
    label: "Strikethrough",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU],
    run: () => {
      styleByWrapping(editor, "~~");
    },
  });

  const italicsAction = editor.addAction({
    id: "italics",
    label: "Italics",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
    run: () => {
      styleByWrapping(editor, "_");
    },
  });

  return [boldAction, underlineAction, italicsAction];
};
