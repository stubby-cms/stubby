import { Callout, Note, Tip } from "../content/callout";
import { CustomLink } from "../content/custom-link";
import { PreBlock } from "../content/syntax";

export const components = {
  Note: Note,
  Tip: Tip,
  Callout: Callout,
  a: {
    component: CustomLink,
  },
  pre: PreBlock,
};
