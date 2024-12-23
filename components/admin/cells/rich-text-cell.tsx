import * as React from "react";
import {
  type CustomRenderer,
  getMiddleCenterBias,
  GridCellKind,
} from "@glideapps/glide-data-grid";

import type { CustomCell } from "@glideapps/glide-data-grid";

export interface ArticleCellProps {
  readonly kind: "article-cell";
  readonly content: string;
}

export type ArticleCell = CustomCell<ArticleCellProps>;

const ArticleCellEditor = React.lazy(
  async () => await import("./rich-text-editor"),
);

export const richTextCellRendered: CustomRenderer<ArticleCell> = {
  kind: GridCellKind.Custom,
  isMatch: (c): c is ArticleCell => (c.data as any).kind === "article-cell",
  draw: (args, cell) => {
    const { ctx, theme, rect } = args;
    const content = cell.data.content;

    const maxWidth = rect.width - 2 * theme.cellHorizontalPadding - 20;
    let data = content || "";

    while (ctx.measureText(data).width > maxWidth && data.length > 0) {
      data = data.slice(0, -1);
    }

    if (data.length < content.length) {
      data += "...";
    }

    ctx.fillStyle = theme.textDark;
    ctx.fillText(
      data,
      rect.x + theme.cellHorizontalPadding,
      rect.y + rect.height / 2 + getMiddleCenterBias(ctx, theme),
    );

    return true;
  },
  provideEditor: () => ({
    editor: (p) => {
      return (
        <React.Suspense fallback={null}>
          <ArticleCellEditor {...p} />
        </React.Suspense>
      );
    },
    styleOverride: {
      position: "fixed",
      left: "12.5vw",
      top: "12.5vh",
      width: "60vw",
      borderRadius: "12px",
      maxWidth: "unset",
      maxHeight: "unset",
    },
    disablePadding: true,
  }),
  onPaste: (val, d) => ({
    ...d,
    content: val,
  }),
};
