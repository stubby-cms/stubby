import { Info, Lightbulb } from "lucide-react";

export const Note = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-sky-500/20 bg-sky-50/50 px-5 py-4 dark:border-sky-500/30 dark:bg-sky-500/10">
      <div className="flex items-start space-x-3">
        <Info className="mt-1 h-5 w-5 text-sky-600" />
        <div className="prose flex-1 overflow-x-auto text-sky-900 dark:text-sky-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Tip = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-50/50 px-5 py-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <div className="flex items-start space-x-3">
        <Lightbulb className="mt-1 h-5 w-5 text-green-600" />
        <div className="prose flex-1 overflow-x-auto text-green-900 dark:text-green-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Callout = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "tip" | "note";
}) => {
  if (variant === "tip") {
    return <Tip>{children}</Tip>;
  } else if (variant === "note") {
    return <Note>{children}</Note>;
  } else {
    return <div>{children}</div>;
  }
};
