import type { Metadata } from "next";
import { ExpenseListView } from "@/features/expenses";

export const metadata: Metadata = {
  title: "Expense & Income Tracker — AdSkill PayTrack AI",
  description:
    "Track office expenses and income transactions with receipt uploads, category filtering, and KPI summaries for the AdSkill management team.",
};

export default function ExpenseTrackerPage() {
  return <ExpenseListView />;
}
