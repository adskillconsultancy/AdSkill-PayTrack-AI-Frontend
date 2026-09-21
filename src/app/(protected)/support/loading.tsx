"use client";

import { Loader2 } from "lucide-react";

export default function SupportLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading AdSkill Client Support & Advisory Hub...
      </p>
    </div>
  );
}
