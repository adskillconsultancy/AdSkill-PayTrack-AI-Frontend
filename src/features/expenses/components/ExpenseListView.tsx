"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Plus,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  ExternalLink,
  Trash2,
  ShieldAlert,
  Receipt,
  Eye,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { ColumnDef, DataTable } from "@/components/common/DataTable";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { useConfirm } from "@/hooks/useConfirm";
import {
  useGetExpensesQuery,
  useDeleteExpenseMutation,
  type ExpenseEntry,
  type TransactionType,
} from "@/services/api/expenses/expensesApi";
import { ExpenseMetricCards } from "./ExpenseMetricCards";
import { ExpenseSearchBar } from "./ExpenseSearchBar";
import { CreateExpenseModal } from "./CreateExpenseModal";
import { ExpenseDetailModal } from "./ExpenseDetailModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  OFFICE_SUPPLIES: "Office Supplies",
  UTILITIES: "Utilities",
  RENT: "Rent",
  TRAVEL: "Travel",
  MEALS_ENTERTAINMENT: "Meals & Ent.",
  MARKETING: "Marketing",
  SALARY: "Salary",
  SOFTWARE_SUBSCRIPTIONS: "Software",
  EQUIPMENT: "Equipment",
  MAINTENANCE: "Maintenance",
  SERVICE_REVENUE: "Service Revenue",
  CONSULTATION_FEE: "Consultation Fee",
  RETAINER: "Retainer",
  REFERRAL_FEE: "Referral Fee",
  MISCELLANEOUS_INCOME: "Misc. Income",
  TAX: "Tax",
  OTHER: "Other",
};

function formatDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const dateFormatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
    const timeFormatted = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return { dateFormatted, timeFormatted };
  } catch {
    return { dateFormatted: dateStr, timeFormatted: "" };
  }
}

function CategoryBadge({ category, other }: { category: string; other?: string }) {
  const label = other || CATEGORY_LABELS[category] || category;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: TransactionType }) {
  if (type === "EXPENSE") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-rose-50 text-rose-600 border border-rose-200">
        <TrendingDown className="h-3 w-3" />
        Expense
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
      <TrendingUp className="h-3 w-3" />
      Income
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ExpenseListView() {
  const { user, isSuperAdmin, hasPermission } = usePermissions();
  const { confirm, alert } = useConfirm();

  const canRead = hasPermission("expense:read");
  const canCreate = hasPermission("expense:create");
  const canDelete = hasPermission("expense:delete");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | "ALL">("ALL");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [sortOption, setSortOption] = React.useState("Newest First");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [defaultModalType, setDefaultModalType] = React.useState<TransactionType>("EXPENSE");
  const [selectedExpense, setSelectedExpense] = React.useState<ExpenseEntry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const pageSize = 10;

  const [deleteExpense] = useDeleteExpenseMutation();

  const handleDelete = async (item: ExpenseEntry) => {
    const isExpense = item.type === "EXPENSE";
    const ok = await confirm({
      title: "Delete Ledger Entry",
      message: `Are you sure you want to delete this ${isExpense ? "expense" : "income"} record of $${Number(item.amount).toFixed(2)}?\nThis action will immediately update the financial ledger.`,
      confirmText: "Delete Entry",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (ok) {
      try {
        await deleteExpense(item.id).unwrap();
        await alert({
          title: "Entry Deleted",
          message: "The transaction has been successfully removed from the office ledger.",
          variant: "success",
        });
      } catch (err: any) {
        await alert({
          title: "Delete Failed",
          message: err?.data?.message || "Failed to delete transaction. Please try again.",
          variant: "danger",
        });
      }
    }
  };

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Sort mapping
  const { sortBy, sortOrder } = React.useMemo(() => {
    switch (sortOption) {
      case "Oldest First":
        return { sortBy: "transactionDate" as const, sortOrder: "asc" as const };
      case "Amount: High to Low":
        return { sortBy: "amount" as const, sortOrder: "desc" as const };
      case "Amount: Low to High":
        return { sortBy: "amount" as const, sortOrder: "asc" as const };
      default:
        return { sortBy: "transactionDate" as const, sortOrder: "desc" as const };
    }
  }, [sortOption]);

  const { data: response, isLoading, isFetching } = useGetExpensesQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    type: typeFilter !== "ALL" ? typeFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
  });

  const items: ExpenseEntry[] = response?.data?.items || [];
  const meta = response?.meta;
  const kpis = response?.data?.kpis || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    incomeCount: 0,
    expenseCount: 0,
  };

  const totalCount = meta?.total ?? items.length;
  const totalPages = meta?.totalPage ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setStartDate("");
    setEndDate("");
    setSortOption("Newest First");
    setCurrentPage(1);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Currency", "Description", "Created By"];
    const rows = items.map((item) => [
      `"${new Date(item.transactionDate).toLocaleDateString()}"`,
      item.type,
      item.category === "OTHER" ? `"${item.otherCategory || "Other"}"` : `"${CATEGORY_LABELS[item.category] || item.category}"`,
      item.amount,
      item.currency,
      `"${item.description || ""}"`,
      `"${item.createdBy.name}"`,
    ]);
    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `adskill_expense_tracker_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  // Access guard
  if (user && !canRead) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-[#0a0a0a] tracking-tight">Access Restricted</h2>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-[#64748B]">
          You do not have permission to view the Expense & Income Tracker.
        </p>
        <div className="mt-6">
          <Button asChild className="rounded-xl bg-[#0a0a0a] text-white text-xs font-bold px-5 h-10">
            <Link href={ROUTES.DASHBOARD}>Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Table columns (1st Date & Time, 2nd Type, 3rd Category / Field, then Description, Amount, Logged By, Receipt, Action)
  const columns: ColumnDef<ExpenseEntry>[] = [
    {
      key: "dateTime",
      header: "Date & Time",
      cell: (item) => {
        const { dateFormatted, timeFormatted } = formatDateTime(item.transactionDate);
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-[#64748B] shrink-0">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="font-bold text-[#0a0a0a] text-xs block leading-tight">
                {dateFormatted}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">
                {timeFormatted}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      cell: (item) => <TypeBadge type={item.type} />,
    },
    {
      key: "category",
      header: "Category / Field",
      cell: (item) => (
        <CategoryBadge category={item.category} other={item.otherCategory} />
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (item) => (
        <p className="text-xs text-[#0a0a0a] max-w-[220px] truncate font-medium" title={item.description || ""}>
          {item.description || <span className="text-[#94A3B8] italic">No description</span>}
        </p>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item) => {
        const amount = Number(item.amount || 0);
        const isExpense = item.type === "EXPENSE";
        return (
          <div>
            <span
              className={`font-mono font-black text-xs px-2 py-0.5 rounded-md border ${
                isExpense
                  ? "text-rose-700 bg-rose-50 border-rose-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}
            >
              {isExpense ? "-" : "+"}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5 font-mono">{item.currency}</span>
          </div>
        );
      },
    },
    {
      key: "createdBy",
      header: "Logged By",
      cell: (item) => (
        <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">
          {item.createdBy?.name || "System"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      cell: (item: ExpenseEntry) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedExpense(item);
              setIsDetailModalOpen(true);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            title="View details, receipt & edit"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => handleDelete(item)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Delete entry"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    } as ColumnDef<ExpenseEntry>,
  ];

  return (
    <>
      <CreateExpenseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultType={defaultModalType}
      />

      <ExpenseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        canEdit={canCreate}
      />

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
              <Link href={ROUTES.DASHBOARD} className="hover:text-[#0a0a0a] transition-colors">
                Management
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
              <span className="text-[#0a0a0a]">Expense & Income Tracker</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0a0a0a]">
                Office Expense & Income Tracker
              </h1>
              <span className="inline-flex items-center rounded-lg bg-[#0a0a0a] text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                FINANCE
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 px-3 rounded-xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#64748B]" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="h-9 px-3 rounded-xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-[#4F46E5]" />
              Print
            </Button>
            {canCreate && (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    setDefaultModalType("EXPENSE");
                    setIsCreateModalOpen(true);
                  }}
                  className="h-9 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm gap-1.5 cursor-pointer transition-all"
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Add Expense
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setDefaultModalType("INCOME");
                    setIsCreateModalOpen(true);
                  }}
                  className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm gap-1.5 cursor-pointer transition-all"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Add Income
                </Button>
              </>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <ExpenseMetricCards kpis={kpis} isLoading={isLoading} />

        {/* Search & Filters */}
        <ExpenseSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          sortOption={sortOption}
          onSortChange={(s) => { setSortOption(s); setCurrentPage(1); }}
          onResetFilters={handleResetFilters}
        />

        {/* Data Table */}
        <DataTable<ExpenseEntry>
          title="EXPENSE & INCOME LEDGER"
          data={items}
          columns={columns}
          keyExtractor={(item) => item.id}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          itemLabel="transactions"
          sortBy={sortOption}
          sortOptions={[
            "Newest First",
            "Oldest First",
            "Amount: High to Low",
            "Amount: Low to High",
          ]}
          isLoading={isLoading || isFetching}
          onSortChange={(s) => { setSortOption(s); setCurrentPage(1); }}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </>
  );
}
