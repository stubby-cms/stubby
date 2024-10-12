import { clsx } from "clsx";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  theme?: "light" | "dark";
  src?: string;
}

export async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value);
}

export function CopyButton({
  value,
  className,
  src,
  theme = "light",
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCopied(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [hasCopied]);

  return (
    <div className="copy-button-container">
      <Button
        size="icon"
        variant="ghost"
        className={clsx(
          "relative z-10 h-7 w-7 hover:bg-zinc-700 hover:text-zinc-50",
          theme === "dark"
            ? "bg-zinc-900 text-zinc-50"
            : "bg-zinc-50 text-zinc-900",
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          copyToClipboardWithMeta(value);
          setHasCopied(true);
        }}
        type="button"
        {...props}
      >
        <span className="sr-only">Copy</span>
        {hasCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      </Button>
      <div className="copy-button-tooltip">
        {hasCopied ? "Copied!" : "Copy"}
      </div>
    </div>
  );
}
