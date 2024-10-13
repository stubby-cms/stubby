import type { Monaco } from "@monaco-editor/react";

function getLastOpenedTag(text: string) {
  // get all tags inside of the content
  var tags = text.match(/<\/*(?=\S*)([a-zA-Z-]+)/g);
  if (!tags) {
    return undefined;
  }
  // we need to know which tags are closed
  var closingTags = [];
  for (var i = tags.length - 1; i >= 0; i--) {
    if (tags[i].indexOf("</") === 0) {
      closingTags.push(tags[i].substring("</".length));
    } else {
      // get the last position of the tag
      var tagPosition = text.lastIndexOf(tags[i]);
      var tag = tags[i].substring("<".length);
      var closingBracketIdx = text.indexOf("/>", tagPosition);
      // if the tag wasn't closed
      if (closingBracketIdx === -1) {
        // if there are no closing tags or the current tag wasn't closed
        if (
          !closingTags.length ||
          closingTags[closingTags.length - 1] !== tag
        ) {
          // we found our tag, but let's get the information if we are looking for
          // a child element or an attribute
          text = text.substring(tagPosition);
          return {
            tagName: tag,
            isAttributeSearch: text.indexOf("<") > text.indexOf(">"),
          };
        }
        // remove the last closed tag
        closingTags.splice(closingTags.length - 1, 1);
      }
      // remove the last checked tag and continue processing the rest of the content
      text = text.substring(0, tagPosition);
    }
  }
}

function getAreaInfo(text: string) {
  // opening for strings, comments and CDATA
  var items = ['"', "'", "<!--", "<![CDATA["];
  var isCompletionAvailable = true;
  // remove all comments, strings and CDATA
  text = text.replace(
    /"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g,
    "",
  );
  for (var i = 0; i < items.length; i++) {
    var itemIdx = text.indexOf(items[i]);
    if (itemIdx > -1) {
      // we are inside one of unavailable areas, so we remote that area
      // from our clear text
      text = text.substring(0, itemIdx);
      // and the completion is not available
      isCompletionAvailable = false;
    }
  }
  return {
    isCompletionAvailable: isCompletionAvailable,
    clearedText: text,
  };
}

export const registerComponentIntellisense = (monacoEditor: Monaco) => {
  return monacoEditor.languages.registerCompletionItemProvider("mdx", {
    triggerCharacters: ["<"],
    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - 1, // Start from the '/' character
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };

      var textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      var areaUntilPositionInfo = getAreaInfo(textUntilPosition);

      // // if we don't want any suggestions, return empty array
      // if (!areaUntilPositionInfo.isCompletionAvailable) {
      //   return [];
      // }

      var lastOpenedTag = getLastOpenedTag(areaUntilPositionInfo.clearedText);

      const suggestions = [
        {
          label: "Tip",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.KeepWhitespace,
          documentation: {
            value:
              "Show a callout in blue color with a bulb icon \n `<Tip> Your information goes here! </Tip>`",
          },
          range,
          filterText: "<tip",
          insertText: "<Tip ",
        },
      ];

      return { suggestions };
    },
  });
};

export const registerBackSlashIntellisense = (monacoEditor: Monaco) => {
  return monacoEditor.languages.registerCompletionItemProvider("mdx", {
    triggerCharacters: ["/"],

    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - 1, // Start from the '/' character
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };

      const suggestions = [
        {
          label: "Tip",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "A Tip",
          range,
          filterText: "/tip",
          insertText: "<Tip>\n  ${1:tip content}\n</Tip>",
        },
        {
          label: "Note",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "A Note",
          filterText: "/note",
          insertText: "<Note>\n  ${1:note content}\n</Note>\n",
        },
        {
          label: "Callout",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "A Callout Note",
          filterText: "/callout",
          insertText: '<Callout variant="${1:}">\n  ${2:}\n</Callout>\n',
        },
        {
          label: "Table",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range: {
            startLineNumber: position.lineNumber || 1,
            startColumn: 0,
            endLineNumber: position.lineNumber || 1,
            endColumn: 1,
          },
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "A Table",
          filterText: "/table",
          insertText:
            `
| \${1:Column 1} | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Text     | Text     | Text     |`.trim() + "\n",
        },
        {
          label: "Code",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "A Code Block",
          filterText: "/code",
          insertText: "```${1:language}\n${2:code}\n```\n",
        },
        {
          label: "Link",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "A Link",
          filterText: "/link",
          insertText: "[${1:text}](${2:url})",
        },
        {
          label: "Bold",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Bold Text",
          filterText: "/bold",
          insertText: "**${1:bold text}**",
        },
        {
          label: "Heading 2",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Heading 2",
          filterText: "/h2",
          insertText: "## ${1:Heading 2}",
        },
        {
          label: "Heading 3",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Heading 3",
          filterText: "/h3",
          insertText: "### ${1:Heading 3}",
        },
        {
          label: "Heading 4",
          kind: monacoEditor.languages.CompletionItemKind.Variable,
          range,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Heading 4",
          filterText: "/h3",
          insertText: "### ${1:Heading 4}",
        },
      ];

      return { suggestions };
    },
  });
};
