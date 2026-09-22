import type { Metadata } from "next";
import { Suspense } from "react";
import { InvoicesReceiptsView } from "@/features/invoices-receipts";

export const metadata: Metadata = {
  title: "Invoices & Receipts — AdSkill PayTrack AI",
  description:
    "Generate branded PDF invoices with sequential numbering, view payment receipts, and download official AdSkill financial documents.",
};

export default function InvoicesReceiptsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-10 space-y-6 max-w-7xl mx-auto animate-pulse">
          <div className="h-8 w-72 bg-slate-100 rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
            ))}
          </div>
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <InvoicesReceiptsView />
    </Suspense>
  );
}
