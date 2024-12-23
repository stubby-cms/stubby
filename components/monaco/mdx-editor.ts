import { SchemaField } from "@/app/dashboard/[siteId]/schema/state";
import { type Monaco } from "@monaco-editor/react";
import { IDisposable, editor as monacoEditor, Position } from "monaco-editor";
import { registerCompletion } from "monacopilot";
import { autoCloseTag } from "./auto-close-tag";
import { registerFoldingRangeProvider } from "./folding";
import { registerListFormatters } from "./formatters-list";
import { PlaceholderContentWidget } from "./placeholder-widget";
import { snippets } from "./snippets";
import {
  registerAutoCompleteSuggestions,
  registerFrontMatterSuggestions,
} from "./suggestions";
import { registerTableFormatter } from "./formatters-table";

const wordPattern =
  /([*_]{1,2}|~~|`+)?[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+(_+[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+)*\1/gu;

/**
 * MdxEditor class to manage the Monaco Editor instance and provide additional functionalities.
 */
export class MdxEditor {
  private editor: monacoEditor.IStandaloneCodeEditor;
  private monaco: Monaco;
  private disposers: Set<IDisposable>;
  private static instance: MdxEditor | null = null;

  previousCursorPosition: Position | null = null;

  /**
   * Constructor to initialize the MdxEditor instance.
   * @param editor - The Monaco Editor instance.
   * @param monaco - The Monaco instance.
   * @param schema - The schema fields for the editor.
   */
  private constructor(
    monaco: Monaco | null,
    editor: monacoEditor.IStandaloneCodeEditor | null,
  ) {
    if (!editor || !monaco) {
      throw new Error("No editor or monaco instance provided");
    }

    this.editor = editor;
    this.monaco = monaco;
    this.disposers = new Set<IDisposable>();

    this.registerListeners();
    this.registerActions();
    this.registerFolding();
    this.registerSuggestions();
    this.registerPlaceholder();
    this.registerListFormatters();
    this.registerTableFormatters();

    monaco.languages.setLanguageConfiguration("mdx", {
      wordPattern,
    });
  }

  public static getInstance(
    monaco: Monaco,
    editor: monacoEditor.IStandaloneCodeEditor,
  ): MdxEditor {
    if (!MdxEditor.instance) {
      MdxEditor.instance = new MdxEditor(monaco, editor);
    }
    return MdxEditor.instance;
  }

  public static destroyInstance(): void {
    if (MdxEditor.instance) {
      MdxEditor.instance.dispose();
      MdxEditor.instance = null;
      PlaceholderContentWidget.destroyInstance();
    }
  }

  /**
   * Registers list formatters for the editor.
   */
  private registerListFormatters() {
    const disposers = registerListFormatters(this.editor, this.monaco);
    if (disposers)
      disposers.forEach((disposer) => this.disposers.add(disposer));
  }

  /**
   * Registers a placeholder for the editor.
   */
  private registerPlaceholder() {
    const placeholderWidget = PlaceholderContentWidget.getInstance(
      "Press / for options",
      this.editor,
      this.monaco,
    );

    if (placeholderWidget) this.disposers.add(placeholderWidget);
  }

  /**
   * Registers AI completions for the editor.
   */
  registerAiCompletions() {
    registerCompletion(this.monaco, this.editor, {
      endpoint: "/api/complete",
      language: "mdx",
      maxContextLines: 60,
      trigger: "onTyping",
    });
  }

  /**
   * Registers front matter suggestions for the editor.
   */
  registerFrontMatterSuggestions(schema: SchemaField[]) {
    const frontmatterSuggestionsDisposer = registerFrontMatterSuggestions(
      this.monaco,
      schema,
    );

    if (frontmatterSuggestionsDisposer)
      this.disposers.add(frontmatterSuggestionsDisposer);
  }

  /**
   * Registers suggestions for the editor.
   */
  registerSuggestions() {
    const autoCompleteSuggestionsDisposer = registerAutoCompleteSuggestions(
      this.monaco,
    );

    if (autoCompleteSuggestionsDisposer)
      this.disposers.add(autoCompleteSuggestionsDisposer);
  }

  /**
   * Registers folding for the editor.
   */
  registerFolding() {
    const foldingRangeProviderDisposer = registerFoldingRangeProvider(
      this.editor,
      this.monaco,
    );

    if (foldingRangeProviderDisposer)
      this.disposers.add(foldingRangeProviderDisposer);
  }

  /**
   * Registers actions for the editor.
   */
  async registerActions() {
    const { registerFormatterActions } = await import("./formatters-text");

    const formatActionsDisposers = registerFormatterActions(
      this.editor,
      this.monaco,
    );

    if (formatActionsDisposers)
      formatActionsDisposers.forEach((d) => this.disposers.add(d));
  }

  /**
   * Registers table formatters for the editor.
   */
  private registerTableFormatters() {
    const tableFormatterDisposers = registerTableFormatter(
      this.editor,
      this.monaco,
    );

    if (tableFormatterDisposers)
      tableFormatterDisposers.forEach((disposer) =>
        this.disposers.add(disposer),
      );
  }

  /**
   * Registers event listeners for the editor.
   */
  registerListeners() {
    const model = this.editor.getModel();

    if (!model) return;

    const onChangeContentDisposer = model.onDidChangeContent((event) =>
      this.handleContentChange(event),
    );

    const onWillDisposeDisposer = model.onWillDispose(() => {
      this.dispose();
    });

    /* To ensure the quick fix command panel is rendered appropriately, we add a negative margin to the panel. This adjustment prevents the panel from overlapping with the cursor or selected text. However, this can cause the panel to appear far from the word when triggered via the Command + . shortcut. To differentiate between mouse click and keyboard shortcut triggers, we add a custom class name using the addCommand method. This class name allows us to conditionally apply the margin. Once the widget loses focus, we remove the class by subscribing to the onDidBlurEditorWidget event. */
    const onWidgetBlurredDisposer = this.editor.onDidBlurEditorWidget(
      this.handleWidgetBlur,
    );

    if (onChangeContentDisposer) this.disposers.add(onChangeContentDisposer);
    if (onWillDisposeDisposer) this.disposers.add(onWillDisposeDisposer);
    if (onWidgetBlurredDisposer) this.disposers.add(onWidgetBlurredDisposer);
  }

  /**
   * Handles the widget focus event.
   */
  handleWidgetBlur() {
    document.querySelector(".mdx-editor")?.classList.remove("manual-widget");
  }

  /**
   * Handles the content change event.
   * @param event - The event object.
   */
  handleContentChange(event: monacoEditor.IModelContentChangedEvent) {
    autoCloseTag(this.editor, this.monaco, event);
  }

  /**
   * Inserts a snippet into the editor at the current cursor position.
   * @param snippetId - The ID of the snippet to insert.
   */
  insertSnippet(snippetId: string) {
    let snippet = snippets[snippetId];
    if (!snippet) return;
    let snippetController = this.editor.getContribution("snippetController2");
    if (snippetController) (snippetController as any).insert(snippet.insetText);
  }

  /**
   * Triggers an action in the editor.
   * @param actionId - The ID of the action to trigger.
   */
  triggerAction(actionId: string) {
    this.editor.trigger("", actionId, {});
  }

  /**
   * Focuses the editor.
   */
  focus() {
    this.editor.focus();
  }

  private dispose(): void {
    this.disposers.forEach((disposer) => disposer.dispose());
    this.disposers.clear();
  }
}
