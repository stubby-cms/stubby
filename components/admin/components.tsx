import { CustomLink } from "../content/custom-link";

import {
  Tip,
  Warning,
  Note,
  Info,
  Step,
  Steps,
  Tabs,
  Accordion,
  AccordionGroup,
} from "@stubby-cms/ui";

export const components = {
  Note: Note,
  Tip: Tip,
  Info: Info,
  Warning: Warning,
  Step: Step,
  Steps: Steps,
  Tabs: Tabs,
  AccordionGroup,
  Accordion,
  a: {
    component: CustomLink,
  },
};
