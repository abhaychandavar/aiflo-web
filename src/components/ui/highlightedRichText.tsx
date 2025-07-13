import { cn } from "@/lib/utils";
import React from "react";

interface HighlightedTextProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CodeProps extends React.HTMLAttributes<HTMLElement> {}

export const HighlightedText: React.FC<HighlightedTextProps> & {
  Content: React.FC<ContentProps>;
  Code: React.FC<CodeProps>;
} = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-[rgba(255,215,0,0.1)] backdrop-blur-md border border-yellow-300/50 rounded-xl p-4 shadow-[0_0_10px_rgba(255,215,0,0.4)] text-sm text-black",
        className
      )}
      {...props}
    />
  );
};

HighlightedText.Content = ({ className, ...props }) => (
  <div className={cn("space-y-2 text-black", className)} {...props} />
);

HighlightedText.Code = ({ className, children, ...props }) => (
  <code
    className={cn(
      "inline-block bg-yellow-100 border border-yellow-300 text-muted-foreground rounded-md px-2 py-1 font-mono text-sm",
      className
    )}
    {...props}
  >
    <p className="text-sm text-muted-foreground">{children}</p>
  </code>
);
