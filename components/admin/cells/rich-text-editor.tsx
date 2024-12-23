import type { ProvideEditorComponent } from "@glideapps/glide-data-grid";
import { ArticleCell } from "./rich-text-cell";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

const ArticleCellEditor: ProvideEditorComponent<ArticleCell> = (p) => {
  const [tempValue, setTempValue] = useState(p.value.data.content);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  const onSave = useCallback(() => {
    p.onFinishedEditing({
      ...p.value,
      data: {
        ...p.value.data,
        content: tempValue,
      },
    });
  }, [p, tempValue]);

  const onClose = useCallback(() => {
    p.onFinishedEditing(undefined);
  }, [p]);

  if (p.value.readonly) {
    return (
      <div
        id="gdg-markdown-readonly"
        onKeyDown={onKeyDown}
        style={{ height: "75vh", padding: "35px" }}
      >
        {p.value.data.content}
      </div>
    );
  }

  return (
    <div id="gdg-markdown-wysiwyg" onKeyDown={onKeyDown}>
      <textarea
        onChange={(event) => {
          setTempValue(event.target.value);
        }}
        value={tempValue}
        autoFocus
        className="box-shadow-none h-52 w-full border-none bg-background p-4 outline-none"
      ></textarea>
      <div className="flex justify-end gap-4 p-4">
        <Button variant={"ghost"} onClick={onClose}>
          Close
        </Button>
        <Button variant={"brand"} onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default ArticleCellEditor;
