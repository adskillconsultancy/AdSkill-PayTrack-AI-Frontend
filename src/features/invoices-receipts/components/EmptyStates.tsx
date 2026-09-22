"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, Receipt, ShieldAlert, Plus, Sparkles } from "lucide-react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function EmptyDocState({ children, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200/80 bg-slate-50/50", className)}>
      {children}
    </div>
  );
}

export function InvoiceEmptyState({ onGenerate, canGenerate }: { onGenerate?: () => void; canGenerate?: boolean }) {
  return (
    <EmptyDocState>
      <div className="relative mb-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
          <FileText className="h-8 w-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-amber-400 text-white flex items-center justify-center shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      </div>
      <h3 className="text-base font-black text-slate-900 mb-1.5">No Invoices Issued Yet</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        Invoices are generated based on the active payment plan contracted for this client case. Once generated, they receive an immutable sequential number.
      </p>
      {canGenerate && onGenerate && (
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Generate First Invoice
        </button>
      )}
    </EmptyDocState>
  );
}

export function ReceiptEmptyState() {
  return (
    <EmptyDocState>
      <div className="relative mb-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
          <Receipt className="h-8 w-8" />
        </div>
      </div>
      <h3 className="text-base font-black text-slate-900 mb-1.5">No Receipts on Record</h3>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        Official payment receipts are automatically issued once a client payment is confirmed and audited by authorized financial staff.
      </p>
    </EmptyDocState>
  );
}

export function AccessDeniedState() {
  return (
    <EmptyDocState>
      <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-200">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h3 className="text-base font-black text-slate-900 mb-1">Access Restricted</h3>
      <p className="text-xs text-slate-500 max-w-xs">
        You do not possess the required security permissions to inspect these financial documents.
      </p>
    </EmptyDocState>
  );
}
