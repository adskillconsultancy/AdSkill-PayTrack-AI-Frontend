"use client";

import * as React from "react";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";

interface ExpenseKPIs {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
}

interface ExpenseMetricCardsProps {
  kpis: ExpenseKPIs;
  isLoading?: boolean;
}

function MetricSkeleton() {
  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-2xs animate-pulse">
      <div className="h-3 w-20 bg-[#EAE6DF] rounded mb-3" />
      <div className="h-7 w-32 bg-[#EAE6DF] rounded mb-2" />
      <div className="h-2.5 w-16 bg-[#EAE6DF] rounded" />
    </div>
  );
}

export function ExpenseMetricCards({ kpis, isLoading }: ExpenseMetricCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <MetricSkeleton key={i} />)}
      </div>
    );
  }

  const netPositive = kpis.netBalance >= 0;

  const cards = [
    {
      label: "Total Income",
      value: `$${kpis.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: `${kpis.incomeCount} income entries`,
      icon: TrendingUp,
      iconBg: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    {
      label: "Total Expenses",
      value: `$${kpis.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: `${kpis.expenseCount} expense entries`,
      icon: TrendingDown,
      iconBg: "bg-rose-50 border-rose-200",
      iconColor: "text-rose-600",
      valueColor: "text-rose-700",
    },
    {
      label: "Net Balance",
      value: `${netPositive ? "+" : ""}$${Math.abs(kpis.netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: netPositive ? "Positive cash flow" : "Net deficit",
      icon: DollarSign,
      iconBg: netPositive ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200",
      iconColor: netPositive ? "text-blue-600" : "text-amber-600",
      valueColor: netPositive ? "text-blue-700" : "text-amber-700",
    },
    {
      label: "Total Entries",
      value: (kpis.incomeCount + kpis.expenseCount).toString(),
      sub: "All transactions in view",
      icon: Activity,
      iconBg: "bg-violet-50 border-violet-200",
      iconColor: "text-violet-600",
      valueColor: "text-[#0a0a0a]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-2xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                {card.label}
              </p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border ${card.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-black tracking-tight ${card.valueColor}`}>
              {card.value}
            </p>
            <p className="mt-1 text-[10px] text-[#94A3B8] font-medium">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
