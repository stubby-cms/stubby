import { Theme } from "@glideapps/glide-data-grid";

export const darkTheme = {
  accentColor: "#4F5DFF",
  accentFg: "#ffffff",
  accentLight: "rgba(255, 255, 255, 0.05)",

  textDark: "#f9fafb",
  textMedium: "#AFB1B5",
  textLight: "#7E8086",
  textBubble: "#f9fafb",

  bgIconHeader: "#b8b8b8",
  fgIconHeader: "#0e0e0a",
  textHeader: "#f9fafb",
  textHeaderSelected: "#ffffff",

  bgCell: "#030712",
  bgCellMedium: "#030712",
  bgHeader: "#101827",
  bgHeaderHasFocus: "#182235",
  bgHeaderHovered: "#182235",

  bgBubble: "#212121",
  bgBubbleSelected: "#000000",

  bgSearchResult: "#423c24",

  borderColor: "rgba(255, 255, 255, 0.08)",
  drilldownBorder: "rgba(225,225,225,0.4)",

  linkColor: "#4F5DFF",

  cellHorizontalPadding: 8,
  cellVerticalPadding: 3,

  headerIconSize: 18,

  headerFontStyle: "600 13px",
  baseFontStyle: "13px",
  markerFontStyle: "9px",
  fontFamily:
    "Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif",
  editorFontSize: "13px",
  lineHeight: 1.4, //unitless scaler depends on your font
} satisfies Theme;
