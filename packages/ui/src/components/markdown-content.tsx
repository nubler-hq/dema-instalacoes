import React from "react"
import ReactMarkdown from "react-markdown";
import { cn } from "@workspace/ui/lib/utils";

interface MarkdownContentProps {
  children: string;
  className?: string;
}

export function MarkdownContent({ children, className }: MarkdownContentProps) {
  return (
    <div className={cn(
      "prose prose-neutral prose-sm",
      className
    )}>
      <ReactMarkdown>
        {children}
      </ReactMarkdown>
    </div>
  );
}
