"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading3,
  Quote,
  RemoveFormatting,
} from "lucide-react";

export interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your formatted note here...",
  minHeight = "130px",
  disabled = false,
  className,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync external value with editor innerHTML only if content changed from outside
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const format = (command: string, arg: string | undefined = undefined) => {
    if (disabled) return;
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all overflow-hidden bg-white",
        isFocused ? "border-amber-400 ring-2 ring-amber-400/20 shadow-sm" : "border-slate-200",
        disabled ? "opacity-60 pointer-events-none bg-slate-50" : "",
        className,
      )}>
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/90 border-b border-slate-200 text-slate-700">
        <button
          type="button"
          onClick={() => format("bold")}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => format("italic")}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => format("underline")}
          title="Underline (Ctrl+U)"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors">
          <Underline className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => format("formatBlock", "<h3>")}
          title="Subheading"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors">
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => format("insertUnorderedList")}
          title="Bulleted List"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors">
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => format("insertOrderedList")}
          title="Numbered List"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors">
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => format("formatBlock", "<blockquote>")}
          title="Quote"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors">
          <Quote className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => format("removeFormat")}
          title="Clear Formatting"
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors ml-auto">
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content Editable Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={cn(
          "p-3.5 text-xs text-slate-800 leading-relaxed outline-none overflow-y-auto",
          "prose prose-xs max-w-none",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none",
        )}
      />
    </div>
  );
}
