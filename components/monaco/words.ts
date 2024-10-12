import * as monaco from "monaco-editor";

const snippets = [
  {
    label: "fk",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "fk ${1:table_name}.${2:field}",
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Foreign key to table field statement",
  },
  {
    label: "fkc",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "fk ${1:column_name} = ${2:table_name}.${3:field}",
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Foreign key to table field statement",
  },
];

class MyCompletionItemProvider {
  provideCompletionItems(model: any, position: any) {
    const wordModel = model.getWordAtPosition(position);
    const columnBeforeWord =
      !!wordModel && wordModel.word.length
        ? position.column - wordModel.word.length
        : 0;

    // Get all the text content before the "word at cursor"
    var textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: Math.abs(columnBeforeWord),
    });

    let words = [...textUntilPosition.matchAll(/\w+/gi)].map((x) => x[0]);
    if (!!!words) {
      // No words typed; must be almost at begining... just return snippets
      return { suggestions: snippets };
    }

    // Find unique words that do not include my suggestions
    const labels = snippets.map((s) => s.label.toUpperCase());
    words = [
      ...new Set(
        words.filter((w) => labels.every((l) => l !== w.toUpperCase())),
      ),
    ];

    var merged = [
      ...snippets,
      ...words.map((w) => {
        return {
          kind: monaco.languages.CompletionItemKind.Text,
          label: w,
          insertText: w,
        };
      }),
    ];

    // Return combined suggestions
    return { suggestions: merged };
  }
}

module.exports = new MyCompletionItemProvider();
