"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="p-1 hover:text-purple-500 transition-colors" title="Copy Link">
      {copied ? <span className="text-green-500 font-bold text-xs">Copied!</span> : <Copy className="h-4 w-4" />}
    </button>
  );
}