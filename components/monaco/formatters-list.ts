import { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { insertTextAtCursor } from "./utils";

const handleTab = (
  editorInstance: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  outdent = false,
) => {
  editorInstance.trigger(
    "keyboard",
    outdent ? "editor.action.outdentLines" : "editor.action.indentLines",
    null,
  );

  const model = editorInstance.getModel();
  const position = editorInstance.getPosition();
  if (!model || !position) return;

  fixMarker(editorInstance, monaco, position.lineNumber);
};

const handleEnter = (
  editorInstance: editor.IStandaloneCodeEditor,
  monaco: Monaco,
) => {
  const model = editorInstance.getModel();
  const position = editorInstance.getPosition();
  if (!model || !position) return;

  const lineContent = model.getLineContent(position.lineNumber);

  const matches = /^(\s*)([0-9]+)([.)])( +)((\[[ x]\] +)?)/.exec(lineContent);

  if (!matches) {
    editorInstance.trigger("keyboard", "editor.action.insertLineAfter", null);
    return;
  }

  let marker = "1";
  let leadingSpace = matches[1];
  let previousMarker = matches[2];
  let delimiter = matches[3];
  let trailingSpace = matches[4];
  let gfmCheckbox = matches[5].replace("[x]", "[ ]");
  let textIndent = (previousMarker + delimiter + trailingSpace).length;
  marker = String(Number(previousMarker) + 1);

  trailingSpace = " ".repeat(
    Math.max(1, textIndent - (marker + delimiter).length),
  );

  const toBeAdded =
    leadingSpace + marker + delimiter + trailingSpace + gfmCheckbox;

  insertTextAtCursor(editorInstance, monaco, `\n${toBeAdded}`);
  fixMarker(editorInstance, monaco, position.lineNumber);
};

const handleDeleteLine = (
  editorInstance: editor.IStandaloneCodeEditor,
  monaco: Monaco,
) => {
  const model = editorInstance.getModel();
  const position = editorInstance.getPosition();
  if (!model || !position) return;
  editorInstance.trigger("keyboard", "editor.action.deleteLines", null);
  fixMarker(editorInstance, monaco, position.lineNumber);
};

const fixMarker = (
  editorInstance: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  currentLineNumber: number,
) => {
  const model = editorInstance.getModel();
  const position = editorInstance.getPosition();
  if (!model || !position) return;
  if (currentLineNumber < 1 || currentLineNumber > model.getLineCount()) return;

  const currentLine = model.getLineContent(currentLineNumber);

  // Ordered list
  const matches = /^(\s*)([0-9]+)([.)])( +)/.exec(currentLine);

  if (matches != null) {
    let leadingSpace = matches[1];
    let marker = matches[2];
    let delimiter = matches[3];
    let trailingSpace = matches[4];
    let fixedMarker = lookUpwardForMarker(
      editorInstance,
      currentLineNumber,
      leadingSpace.replace(/\t/g, "  ").length,
    );
    let listIndent = marker.length + delimiter.length + trailingSpace.length;
    let fixedMarkerString = String(fixedMarker);

    fixedMarkerString +=
      delimiter +
      " ".repeat(
        Math.max(1, listIndent - (fixedMarkerString + delimiter).length),
      );

    const range = new monaco.Range(
      currentLineNumber,
      leadingSpace.length + 1,
      currentLineNumber,
      leadingSpace.length + listIndent + 1,
    );

    if (marker !== fixedMarkerString) {
      model.pushEditOperations(
        [],
        [
          {
            range: range,
            text: fixedMarkerString,
          },
        ],
        () => null,
      );
    }

    let nextLine = currentLineNumber + 1;

    while (model.getLineCount() >= nextLine) {
      const nextLineText = model.getLineContent(nextLine);

      if (/^\s*[0-9]+[.)] +/.test(nextLineText)) {
        return fixMarker(editorInstance, monaco, nextLine);
      } else if (
        model.getLineContent(nextLine - 1).trim() == "" && // This line is empty
        !nextLineText.startsWith(" ".repeat(3)) && // and doesn't have enough indentation
        !nextLineText.startsWith("\t") // so terminates the current list.
      ) {
        return;
      } else {
        nextLine++;
      }
    }
  }
};

const lookUpwardForMarker = (
  editorInstance: editor.IStandaloneCodeEditor,
  line: number,
  currentIndentation: number,
): number => {
  const model = editorInstance.getModel();
  if (!model) return 1;

  let prevLine = line;
  while (--prevLine >= 0) {
    const prevLineText = model.getLineContent(prevLine).replace(/\t/g, "  ");

    let matches;
    if ((matches = /^(\s*)(([0-9]+)[.)] +)/.exec(prevLineText)) !== null) {
      // The previous line has an ordered list marker
      const prevLeadingSpace: string = matches[1];
      const prevMarker = matches[3];
      if (currentIndentation < prevLeadingSpace.length) {
        // yet to find a sibling item
        continue;
      } else if (currentIndentation == prevLeadingSpace.length) {
        // found a sibling item
        return Number(prevMarker) + 1;
      } else if (currentIndentation > prevLeadingSpace.length) {
        // found a parent item
        return 1;
      } else {
        // not possible
      }
    } else if ((matches = /^(\s*)([-+*] +)/.exec(prevLineText)) !== null) {
      // The previous line has an unordered list marker
      const prevLeadingSpace: string = matches[1];
      if (currentIndentation >= prevLeadingSpace.length) {
        // stop finding
        break;
      }
    } else if ((matches = /^(\s*)\S/.exec(prevLineText)) !== null) {
      // The previous line doesn't have a list marker
      if (matches[1].length < 3) {
        // no enough indentation for a list item
        break;
      }
    }
  }

  return 1;
};

export const registerListFormatters = (
  editorInstance: editor.IStandaloneCodeEditor,
  monaco: Monaco,
) => {
  const cursorIsInList = () => {
    const model = editorInstance.getModel();
    const position = editorInstance.getPosition();
    if (!model || !position) return false;

    const line = model.getLineContent(position.lineNumber);
    return /^\s*(?:[*+\->]|\d+[.)])/.test(line);
  };

  const isCursorInList = editorInstance.createContextKey(
    "isCursorInList",
    cursorIsInList(),
  );

  const onChangeDisposer = editorInstance.onDidChangeCursorPosition(() => {
    isCursorInList.set(cursorIsInList());
  });

  const enterAction = editorInstance.addAction({
    id: "enter-sub-list",
    label: "Enter in list",
    keybindings: [monaco.KeyCode.Enter],
    keybindingContext: "isCursorInList",
    run: () => handleEnter(editorInstance, monaco),
  });

  const tabAction = editorInstance.addAction({
    id: "tab-in-list",
    label: "Indent list",
    keybindings: [monaco.KeyCode.Tab],
    keybindingContext: "isCursorInList",
    run: () => handleTab(editorInstance, monaco),
  });

  const shiftTabAction = editorInstance.addAction({
    id: "shift-tab-in-list",
    label: "Outdent list",
    keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Tab],
    keybindingContext: "isCursorInList",
    run: () => handleTab(editorInstance, monaco, true),
  });

  const deleteLineAction = editorInstance.addAction({
    id: "adjust-marker-on-delete",
    label: "Adjust marker on delete",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX],
    keybindingContext: "isCursorInList",
    run: () => handleDeleteLine(editorInstance, monaco),
  });

  return [
    enterAction,
    tabAction,
    shiftTabAction,
    onChangeDisposer,
    deleteLineAction,
  ];
};
