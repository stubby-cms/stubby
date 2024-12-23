import { getFrontMatterStartAndEnd } from "@/lib/frontmatter";
import { type Monaco } from "@monaco-editor/react";
import { IDisposable, editor as monacoEditor, Position } from "monaco-editor";

export class PlaceholderContentWidget implements monacoEditor.IContentWidget {
  static ID = "editor.widget.placeholderHint";
  private placeholder: string;
  private editor: monacoEditor.IStandaloneCodeEditor;
  private monaco: Monaco;
  private domNode: HTMLElement | null = null;
  private static instance: PlaceholderContentWidget | null = null;
  private disposers = new Set<IDisposable>();

  constructor(
    placeholder: string,
    editor: monacoEditor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) {
    this.placeholder = placeholder;
    this.editor = editor;
    this.monaco = monaco;

    this.disposers.add(
      this.editor.onDidChangeCursorPosition((e) =>
        this.onChangeCursorPosition(e),
      ),
    );

    this.disposers.add(
      this.editor.onDidBlurEditorText(() => this.onDidBlurEditorText()),
    );

    this.disposers.add(
      this.editor.onDidFocusEditorText(() => this.onDidFocusEditorText()),
    );
  }

  onDidBlurEditorText() {
    this.editor.removeContentWidget(this);
  }

  onDidFocusEditorText() {
    const model = this.editor.getModel();
    if (!model) return;
    const position = this.editor.getPosition();
    if (!position) return;

    const pos = model.getOffsetAt(position);
    const { start, end } = getFrontMatterStartAndEnd(model.getValue());
    if (pos <= start || pos >= end) return;

    const lineText = model.getLineContent(position.lineNumber);
    if (position.column == 1 && lineText.trim() === "") {
      this.editor.addContentWidget(this);
    }
  }

  onChangeCursorPosition(e: monacoEditor.ICursorPositionChangedEvent) {
    const model = this.editor.getModel();
    if (!model) return;

    const lineText = model.getLineContent(e.position.lineNumber);

    const pos = model.getOffsetAt(e.position);
    const { start, end } = getFrontMatterStartAndEnd(model.getValue());

    if (pos >= start && pos <= end) {
      this.editor.removeContentWidget(this);
      return;
    }

    if (e.position.column == 1 && lineText.trim() === "") {
      if ((this.editor as any)._contentWidgets[PlaceholderContentWidget.ID]) {
        this.editor.layoutContentWidget(this);
        return;
      }
      this.editor.addContentWidget(this);
    } else {
      this.editor.removeContentWidget(this);
    }
  }

  getId() {
    return PlaceholderContentWidget.ID;
  }

  getDomNode() {
    if (!this.domNode) {
      this.domNode = document.createElement("div");
      this.domNode.style.width = "max-content";
      this.domNode.textContent = this.placeholder;
      this.domNode.className = "monaco-editor-placeholder";
      this.editor.applyFontInfo(this.domNode);
    }

    return this.domNode;
  }

  getPosition() {
    const position = this.editor.getPosition();
    if (!position) return null;

    return {
      position: { lineNumber: position.lineNumber, column: 1 },
      preference: [this.monaco.editor.ContentWidgetPositionPreference.EXACT],
    };
  }

  dispose() {
    this.editor.removeContentWidget(this);
    this.disposers.forEach((disposer) => disposer.dispose());
  }

  static getInstance(
    placeholder: string,
    editor: monacoEditor.IStandaloneCodeEditor,
    monaco: Monaco,
  ): PlaceholderContentWidget {
    if (!PlaceholderContentWidget.instance) {
      PlaceholderContentWidget.instance = new PlaceholderContentWidget(
        placeholder,
        editor,
        monaco,
      );
    }
    return PlaceholderContentWidget.instance;
  }

  static destroyInstance(): void {
    if (PlaceholderContentWidget.instance) {
      PlaceholderContentWidget.instance.dispose();
      PlaceholderContentWidget.instance = null;
    }
  }
}
