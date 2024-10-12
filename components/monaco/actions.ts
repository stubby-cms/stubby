// import * as monaco from "monaco-editor";

import { type Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

const make = (editor: editor.IStandaloneCodeEditor, cmd: string) => {
  if (!editor) return;

  const position = editor.getPosition();
  const selection = editor.getSelection();

  if (!position || !selection) return;

  const range = {
    startLineNumber: selection?.startLineNumber || 1,
    startColumn: selection?.startColumn || 1,
    endLineNumber: selection?.endLineNumber || 1,
    endColumn: selection?.endColumn || 1,
  };

  const line = editor.getModel()?.getLineContent(position.lineNumber);
  const text = editor.getModel()?.getValueInRange(selection);

  let op = { range, text: "" };
  let move = 0;

  switch (cmd) {
    case "animation": {
      if (text) {
        if (text.match(/\n\s*\n/g)) {
          op.text = "      {{1}}\n<section>\n\n" + text + "\n\n</section>\n";
        } else {
          op.text = "      {{1}}\n" + text;
        }
      } else {
        op.text = "      {{1}}\n";
      }
      break;
    }

    case "audio": {
      if (text) {
        op.text = `?[](${text})`;
      } else {
        op.text = "?[](https://)";
      }
      move = 2;
      break;
    }

    case "bold": {
      op.text = "**" + text + "**";
      if (text === "") {
        move = 2;
      }
      break;
    }

    case "code": {
      if (text) {
        op.text = "```\n" + text + "\n```";
      } else {
        op.text =
          '``` js\nvar message="Hello World"\nconsole.log(message)\n```';
      }

      break;
    }

    case "code-inline": {
      op.text = "`" + text + "`";
      if (text === "") {
        move = 1;
      }
      break;
    }

    case "code-executable": {
      if (text) {
        op.text = `\`\`\`\`
${text}
\`\`\`
<script>@input <\/script>
`;
      } else {
        op.text = `\`\`\` js
var message = "Hello World"
console.log(message)
message.length
\`\`\`
<script>@input <\/script>
`;
      }

      break;
    }

    case "image": {
      if (text) {
        op.text = `![](${text})`;
      } else {
        op.text = "![](https://)";
      }
      move = 2;
      break;
    }

    case "italic": {
      op.text = "_" + text + "_";
      if (text === "") {
        move = 1;
      }
      break;
    }

    case "keyboard": {
      op.text = `<kbd>${text}<\/kbd>`;
      if (text === "") {
        move = 5;
      }
      break;
    }

    case "line": {
      op = {
        range: {
          startLineNumber: position.lineNumber || 1,
          startColumn: 0,
          endLineNumber: position.lineNumber || 1,
          endColumn: 1,
        },
        text: "---\n\n",
      };

      break;
    }

    case "link": {
      op.text = "[](https://)";
      move = 1;
      break;
    }

    case "list-check": {
      op.text = "- [ ] " + text?.replace(/\n/g, "\n- [ ] ");
      break;
    }

    case "list-ordered": {
      if (text) {
        const lines = text.split("\n");

        for (let i = 0; i < lines.length; i++) {
          lines[i] = i + 1 + ". " + lines[i];
        }

        op.text = lines.join("\n");
      } else {
        op.text = "1. ";
      }

      break;
    }

    case "list-unordered": {
      op.text = "* " + text?.replace(/\n/g, "\n* ");
      break;
    }

    case "quote": {
      op.text = "> " + text?.replace(/\n/g, "\n> ");
      break;
    }

    case "strikethrough": {
      op.text = "~" + text + "~";
      if (text === "") {
        move = 1;
      }
      break;
    }

    case "superscript": {
      op.text = "^" + text + "^";
      if (text === "") {
        move = 1;
      }
      break;
    }

    case "table": {
      op = {
        range: {
          startLineNumber: position.lineNumber || 1,
          startColumn: 0,
          endLineNumber: position.lineNumber || 1,
          endColumn: 1,
        },
        text: "| Column 1 | Column 2 | Column 3 |\n| -------- | :------: | -------: |\n| Text     |   Text   |     Text |\n\n",
      };

      break;
    }

    case "underline": {
      op.text = "~~" + text + "~~";
      if (text === "") {
        move = 2;
      }
      break;
    }
  }

  editor.executeEdits("", [op]);

  if (move) {
    editor.setPosition({
      lineNumber: position.lineNumber,
      column: position.column + move,
    });
  }

  editor.focus();
};

function styleByWrapping(
  editor: editor.IStandaloneCodeEditor,
  wrapper: string,
) {
  const selection = editor.getSelection();
  const model = editor.getModel();
  if (!selection || !model) return;

  const text = model.getValueInRange(selection);

  const range = {
    startLineNumber: selection.startLineNumber,
    startColumn: selection.startColumn,
    endLineNumber: selection.endLineNumber,
    endColumn: selection.endColumn,
  };

  const op = {
    range,
    text: wrapper + text + wrapper,
  };

  editor.executeEdits("", [op]);
}

export const registerFormatters = (
  editor: editor.IStandaloneCodeEditor,
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
      make(editor, "strikethrough");
    },
  });

  const italicsAction = editor.addAction({
    id: "italics",
    label: "Italics",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
    run: () => {
      make(editor, "italic");
    },
  });

  return [boldAction, underlineAction, italicsAction];
};
