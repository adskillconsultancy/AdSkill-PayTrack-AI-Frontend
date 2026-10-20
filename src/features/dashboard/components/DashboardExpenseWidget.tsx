"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useGetExpenseDashboardSummaryQuery } from "@/services/api/expenses/expensesApi";

function StatRow({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
      <div className="flex items-center gap-2">
        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-3 w-3" />
        </div>
        <span className="text-xs text-[#64748B] font-medium">{label}</span>
      </div>
      <span
        className={`font-mono font-black text-xs ${
          label.includes("Net")
            ? value >= 0
              ? "text-blue-600"
              : "text-amber-600"
            : label.includes("Income")
            ? "text-emerald-700"
            : "text-rose-700"
        }`}
      >
        {value >= 0 && !label.includes("Expense") ? "+" : ""}$
        {Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

export function DashboardExpenseWidget() {
  const { data: response, isLoading, isError } = useGetExpenseDashboardSummaryQuery();
  const summary = response?.data;

  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">
            Office Finance
          </p>
          <h3 className="text-sm font-black text-[#0a0a0a] tracking-tight">
            Expense & Income Summary
          </h3>
        </div>
        <Link
          href={ROUTES.EXPENSE_TRACKER}
          className="flex items-center gap-1 text-[10px] font-bold text-[#64748B] hover:text-[#0a0a0a] transition-colors"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Body */}
      <div className="px-5 pb-5">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#94A3B8]" />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 py-4 text-xs text-[#94A3B8]">
            <AlertCircle className="h-4 w-4" />
            Could not load summary
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            {/* Current Month */}
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                This Month
              </p>
              <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3 py-1">
                <StatRow
                  label="Total Income"
                  value={summary.currentMonth.totalIncome}
                  color="bg-emerald-100 text-emerald-600"
                  icon={TrendingUp}
                />
                <StatRow
                  label="Total Expenses"
                  value={-summary.currentMonth.totalExpenses}
                  color="bg-rose-100 text-rose-600"
                  icon={TrendingDown}
                />
                <StatRow
                  label="Net Balance"
                  value={summary.currentMonth.netBalance}
                  color={
                    summary.currentMonth.netBalance >= 0
                      ? "bg-blue-100 text-blue-600"
                      : "bg-amber-100 text-amber-600"
                  }
                  icon={DollarSign}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#94A3B8] font-medium">
                <span>{summary.currentMonth.incomeCount} income entries</span>
                <span>{summary.currentMonth.expenseCount} expense entries</span>
              </div>
            </div>

            {/* All-Time */}
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                All Time
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Income",
                    value: summary.allTime.totalIncome,
                    color: "text-emerald-700",
                    bg: "bg-emerald-50 border-emerald-200",
                  },
                  {
                    label: "Expenses",
                    value: summary.allTime.totalExpenses,
                    color: "text-rose-700",
                    bg: "bg-rose-50 border-rose-200",
                  },
                  {
                    label: "Net",
                    value: summary.allTime.netBalance,
                    color:
                      summary.allTime.netBalance >= 0 ? "text-blue-700" : "text-amber-700",
                    bg:
                      summary.allTime.netBalance >= 0
                        ? "bg-blue-50 border-blue-200"
                        : "bg-amber-50 border-amber-200",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-xl border p-2.5 text-center ${stat.bg}`}
                  >
                    <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <p className={`font-mono font-black text-xs ${stat.color}`}>
                      ${Math.abs(stat.value).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
