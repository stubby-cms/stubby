import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/cjs/styles/prism/material-dark";

const CodeBlock = ({
  className,
  children,
}: {
  className: string;
  children: string;
}) => {
  let lang = "text"; // default monospaced text
  if (className && className.startsWith("lang-")) {
    lang = className.replace("lang-", "");
  }
  return (
    <SyntaxHighlighter
      customStyle={{
        fontFamily: "var(--font-mono)",
        borderRadius: "12px",
        background: "#000",
        border: "1px solid #333",
        lineHeight: "1.25",
      }}
      language={lang}
      style={style}
      wrapLines={true}
      codeTagProps={{
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "14px",
        },
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
};

export const PreBlock = ({
  children,
  ...rest
}: {
  children: any;
  [key: string]: any;
}) => {
  if ("type" in children && children["type"] === "code") {
    return CodeBlock(children["props"]);
  }
  return <pre {...rest}>{children}</pre>;
};
