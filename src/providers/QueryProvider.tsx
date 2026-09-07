"use client";

// ── RTK Query Provider ─────────────────────────────────
import { Provider } from "react-redux";
import { store } from "@/lib/rtk-query/store";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
