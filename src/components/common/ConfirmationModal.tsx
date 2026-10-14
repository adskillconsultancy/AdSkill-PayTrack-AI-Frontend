"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from "lucide-react";
import { useConfirmStore } from "@/stores/confirm.store";
import { Button } from "@/components/common/Button";

export function ConfirmationModal() {
  const {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    closeWithResult,
  } = useConfirmStore();

  // Handle escape & enter key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeWithResult(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        closeWithResult(true);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeWithResult]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case "success":
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
      default:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white font-bold";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white font-bold";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white font-bold";
      default:
        return "bg-[#0a0a0a] hover:bg-black text-white font-bold";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => closeWithResult(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#EAE6DF] p-6 sm:p-7 space-y-5 z-10 my-8 animate-in zoom-in-95 duration-200">
        {/* Close Icon */}
        <button
          type="button"
          onClick={() => closeWithResult(false)}
          className="absolute top-5 right-5 rounded-2xl p-2 text-slate-400 hover:bg-[#F1ECE4] hover:text-[#0a0a0a] transition-colors"
          title="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          {renderIcon()}
          <div className="space-y-1.5 pr-4">
            <h3 className="text-base sm:text-lg font-black text-[#0a0a0a]">
              {title}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F0ECE6]">
          {type === "confirm" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => closeWithResult(false)}
              className="rounded-2xl h-10 px-4 text-xs font-bold"
            >
              {cancelText || "Cancel"}
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => closeWithResult(true)}
            className={`rounded-2xl h-10 px-5 text-xs ${getConfirmButtonClass()}`}
          >
            {confirmText || (type === "confirm" ? "Confirm" : "Okay")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
