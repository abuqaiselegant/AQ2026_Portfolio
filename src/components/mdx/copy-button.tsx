"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const CopyButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    const sourceCode = extractSourceCode(children);
    await navigator.clipboard.writeText(sourceCode);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const extractSourceCode = (node: React.ReactNode): string => {
    if (typeof node === "string") {
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(extractSourceCode).join("");
    }
    if (React.isValidElement(node)) {
      const { children: nested } = node.props as { children?: React.ReactNode };
      const children = React.Children.map(nested, extractSourceCode)?.join("");
      return `${children}`;
    }
    return "";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button disabled={isCopied} onClick={copy} className={cn("text-zinc-300 cursor-pointer", className)}>
            {isCopied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {isCopied ? "Copied" : "Copy"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
