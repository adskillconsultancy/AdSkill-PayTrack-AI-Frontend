import { Button } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { CreateExpenseModal, ExpenseDetailModal } from "@/features/expenses";
import { useConfirm } from "@/hooks/useConfirm";
import {
  useDeleteExpenseMutation,
  useGetExpensesQuery,
  type ExpenseEntry,
  type TransactionType,
} from "@/services/api/expenses/expensesApi";
import {
  ArrowRight,
  Calendar,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const CATEGORY_NAMES: Record<string, string> = {
  MEALS_ENTERTAINMENT: "Meals & Refreshments",
  OFFICE_SUPPLIES: "Office Supplies",
  UTILITIES: "Utilities",
  RENT: "Office Rent",
  TRAVEL: "Travel & Commute",
  MARKETING: "Marketing",
  SALARY: "Staff Allowances",
  SOFTWARE_SUBSCRIPTIONS: "Software / SaaS",
  EQUIPMENT: "Equipment",
  MAINTENANCE: "Repairs & Maintenance",
  SERVICE_REVENUE: "Service Revenue",
  CONSULTATION_FEE: "Consultation Fee",
  RETAINER: "Retainer",
  REFERRAL_FEE: "Referral Fee",
  MISCELLANEOUS_INCOME: "Misc. Income",
  TAX: "Tax / Refund",
  OTHER: "Other",
};

export function DashboardExpenseSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("EXPENSE");

  // Detail / Edit modal state
  const [selectedExpense, setSelectedExpense] = useState<ExpenseEntry | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { confirm, alert } = useConfirm();
  const [deleteExpense] = useDeleteExpenseMutation();

  // Fetch the 6 most recent transactions for the dashboard table
  const {
    data: response,
    isLoading,
    isError,
  } = useGetExpensesQuery({
    page: 1,
    limit: 6,
    sortBy: "transactionDate",
    sortOrder: "desc",
  });

  const items: ExpenseEntry[] = response?.data?.items || [];

  const handleOpenModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleViewDetail = (item: ExpenseEntry) => {
    setSelectedExpense(item);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (item: ExpenseEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
          message:
            "The transaction has been successfully removed from the office ledger.",
          variant: "success",
        });
      } catch (err: any) {
        await alert({
          title: "Delete Failed",
          message:
            err?.data?.message ||
            "Failed to delete transaction. Please try again.",
          variant: "danger",
        });
      }
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateTime = (dateStr: string) => {
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
  };

  return (
    <>
      <CreateExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={modalType}
      />

      <ExpenseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />

      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/25 shadow-2xs">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-foreground tracking-tight">
                  Office Expense & Income Tracker
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                  Finance & Ops
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time tracking of operational expenses, tea/refreshments,
                utility bills, and direct income
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              onClick={() => handleOpenModal("EXPENSE")}
              className="h-9 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs shadow-rose-200 gap-1.5 cursor-pointer transition-all">
              <TrendingDown className="h-3.5 w-3.5" />
              Add Expense
            </Button>
            <Button
              type="button"
              onClick={() => handleOpenModal("INCOME")}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-200 gap-1.5 cursor-pointer transition-all">
              <TrendingUp className="h-3.5 w-3.5" />
              Add Income
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="h-9 px-3 rounded-xl border-border bg-card text-foreground hover:bg-accent text-xs font-bold gap-1 cursor-pointer">
              <Link href={ROUTES.EXPENSE_TRACKER}>
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-0.5 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Ledger Table without Receipt column */}
        <div className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-2xs">
          <div className="px-4 py-3 bg-muted/40 border-b border-border/60 flex items-center justify-between">
            <span className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Recent Office Ledger Entries
            </span>
            <span className="text-[11px] text-muted-foreground font-semibold">
              Showing {items.length} latest transactions (click row to view full
              details & receipt)
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Failed to load recent expense data.
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                No expense or income records logged yet.
              </p>
              <Button
                type="button"
                onClick={() => handleOpenModal("EXPENSE")}
                className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                Log First Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    {/* 1. Date Time */}
                    <th className="py-2.5 px-4">Date & Time</th>
                    {/* 2. Type */}
                    <th className="py-2.5 px-4">Type</th>
                    {/* 3. Category / Field */}
                    <th className="py-2.5 px-4">Category / Field</th>
                    {/* 4. Description */}
                    <th className="py-2.5 px-4">Description</th>
                    {/* 5. Amount */}
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    {/* 6. Logged By */}
                    <th className="py-2.5 px-4">Logged By</th>
                    {/* 7. Action */}
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((item) => {
                    const isExpense = item.type === "EXPENSE";
                    const categoryLabel =
                      item.category === "OTHER"
                        ? item.otherCategory || "Other"
                        : CATEGORY_NAMES[item.category] || item.category;
                    const { dateFormatted, timeFormatted } = formatDateTime(
                      item.transactionDate,
                    );

                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleViewDetail(item)}
                        className="hover:bg-muted/40 transition-colors group cursor-pointer"
                        title="Click to view full details, receipt image, or edit">
                        {/* 1. Date & Time */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                              <Calendar className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-foreground text-xs block leading-tight">
                                {dateFormatted}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                                {timeFormatted}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                              isExpense
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            }`}>
                            {isExpense ? (
                              <TrendingDown className="h-3 w-3 stroke-[2.5]" />
                            ) : (
                              <TrendingUp className="h-3 w-3 stroke-[2.5]" />
                            )}
                            {item.type}
                          </span>
                        </td>

                        {/* 3. Category / Field */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wide bg-muted border border-border text-foreground">
                            {categoryLabel}
                          </span>
                        </td>

                        {/* 4. Description */}
                        <td className="py-3 px-4 max-w-[260px]">
                          <p
                            className="truncate text-muted-foreground font-medium text-xs"
                            title={item.description || ""}>
                            {item.description || (
                              <span className="italic text-muted-foreground/60">
                                No details
                              </span>
                            )}
                          </p>
                        </td>

                        {/* 5. Amount */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-mono font-black text-xs px-2 py-0.5 rounded-md border ${
                              isExpense
                                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            }`}>
                            {isExpense ? "-" : "+"}
                            {formatCurrency(Number(item.amount), item.currency)}
                          </span>
                        </td>

                        {/* 6. Logged By */}
                        <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-medium text-[11px]">
                          {item.createdBy?.name || "System"}
                        </td>

                        {/* 7. Action: View Details / Edit + Delete */}
                        <td
                          className="py-3 px-4 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewDetail(item)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                              title="View details, receipt & edit">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(item, e)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Delete entry">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
