"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Clock, Sparkles, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useClockInMutation } from "@/services/api/attendance/attendanceApi";
import { cn } from "@/lib/utils";

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_FOCUS_OPTIONS = [
  "Client Consultation",
  "Payment Follow-up",
  "Document Review & Verification",
  "Case Processing & Intake",
  "General Administration",
];

export function ClockInModal({ isOpen, onClose, onSuccess }: ClockInModalProps) {
  const [selectedFocus, setSelectedFocus] = React.useState("");
  const [customFocus, setCustomFocus] = React.useState("");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [clockIn, { isLoading }] = useClockInMutation();

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Lock body scroll and listen for Escape key when open
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const finalFocus = customFocus.trim() || selectedFocus;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clockIn({ currentFocus: finalFocus || undefined }).unwrap();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      alert(apiErr?.data?.message || "Failed to clock in");
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start Shift / Clock In"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#059669]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0a0a0a]">Start Shift / Clock In</h3>
              <p className="text-xs text-[#64748B] font-medium">Record your attendance and active focus</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F1EFEA] text-[#94A3B8] hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0a0a0a] flex items-center justify-between">
              <span>Current Task / Focus (Optional)</span>
              <span className="text-[11px] font-normal text-[#94A3B8]">Quick Dropdown</span>
            </label>

            {/* Quick Dropdown selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-left text-sm text-[#0a0a0a] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 cursor-pointer"
              >
                <span className={cn(!selectedFocus && "text-[#94A3B8]")}>
                  {selectedFocus || "Select focus from list..."}
                </span>
                <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-[#EAE6DF] bg-white p-1.5 shadow-xl z-20 space-y-0.5">
                  {PRESET_FOCUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedFocus(opt);
                        setCustomFocus("");
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full h-9 px-3 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer",
                        selectedFocus === opt
                          ? "bg-[#0a0a0a] text-white"
                          : "hover:bg-[#F8F7F4] text-[#171717]"
                      )}
                    >
                      <span>{opt}</span>
                      {selectedFocus === opt && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Or custom entry */}
            <div className="pt-1">
              <input
                type="text"
                value={customFocus}
                onChange={(e) => {
                  setCustomFocus(e.target.value);
                  if (e.target.value) setSelectedFocus("");
                }}
                placeholder="Or type custom client / task name..."
                className="w-full h-11 px-3.5 rounded-xl border border-[#EAE6DF] bg-white text-sm text-[#0a0a0a] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a] transition-all"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#64748B] flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
            <p>
              Your clock-in timestamp is tracked automatically. When you clock out, you can note your daily accomplishments for the AI Executive Digest.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Clock className="h-4 w-4" />
              <span>{isLoading ? "Clocking In..." : "Confirm & Clock In"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
