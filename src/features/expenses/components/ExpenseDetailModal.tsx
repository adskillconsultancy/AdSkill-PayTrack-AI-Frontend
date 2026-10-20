"use client";

import * as React from "react";
import {
  X,
  TrendingDown,
  TrendingUp,
  Upload,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  Eye,
  Trash2,
  User,
  Clock,
  Sparkles,
  Receipt,
  Download,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useConfirm } from "@/hooks/useConfirm";
import {
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  type ExpenseEntry,
  type OfficeExpenseCategory,
  type TransactionType,
} from "@/services/api/expenses/expensesApi";

const EXPENSE_CATEGORIES: { value: OfficeExpenseCategory; label: string }[] = [
  { value: "MEALS_ENTERTAINMENT", label: "Meals & Entertainment (Tea/Snacks)" },
  { value: "OFFICE_SUPPLIES", label: "Office Supplies & Stationery" },
  { value: "UTILITIES", label: "Utilities (Electricity, Internet, Water)" },
  { value: "RENT", label: "Office Rent" },
  { value: "TRAVEL", label: "Travel & Commute" },
  { value: "MARKETING", label: "Marketing & Advertising" },
  { value: "SALARY", label: "Salary & Staff Allowances" },
  { value: "SOFTWARE_SUBSCRIPTIONS", label: "Software & Cloud Subscriptions" },
  { value: "EQUIPMENT", label: "Equipment & Hardware" },
  { value: "MAINTENANCE", label: "Repairs & Maintenance" },
  { value: "TAX", label: "Tax & Compliance" },
  { value: "OTHER", label: "Other (Custom Category)" },
];

const INCOME_CATEGORIES: { value: OfficeExpenseCategory; label: string }[] = [
  { value: "SERVICE_REVENUE", label: "Direct Service Revenue" },
  { value: "CONSULTATION_FEE", label: "Consultation Fee" },
  { value: "RETAINER", label: "Monthly Retainer Income" },
  { value: "REFERRAL_FEE", label: "Referral Commission" },
  { value: "MISCELLANEOUS_INCOME", label: "Miscellaneous Income" },
  { value: "TAX", label: "Tax Refund / Rebate" },
  { value: "OTHER", label: "Other (Custom Category)" },
];

const CATEGORY_LABELS: Record<string, string> = {
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

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseEntry | null;
  canEdit?: boolean;
}

export function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  canEdit = true,
}: ExpenseDetailModalProps) {
  const { confirm, alert } = useConfirm();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const [isEditMode, setIsEditMode] = React.useState(false);

  // Edit form state
  const [type, setType] = React.useState<TransactionType>("EXPENSE");
  const [category, setCategory] = React.useState<OfficeExpenseCategory>("OTHER");
  const [otherCategory, setOtherCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [description, setDescription] = React.useState("");
  const [transactionDate, setTransactionDate] = React.useState("");
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Populate form fields from expense prop
  React.useEffect(() => {
    if (expense) {
      setType(expense.type);
      setCategory(expense.category);
      setOtherCategory(expense.otherCategory || "");
      setAmount(String(Number(expense.amount) || ""));
      setCurrency(expense.currency || "USD");
      setDescription(expense.description || "");
      try {
        setTransactionDate(new Date(expense.transactionDate).toISOString().slice(0, 10));
      } catch {
        setTransactionDate("");
      }
      setReceiptFile(null);
      setErrors({});
      setIsEditMode(false);
    }
  }, [expense, isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isUpdating && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUpdating, isDeleting, onClose]);

  if (!isOpen || !expense) return null;

  const isExpense = (isEditMode ? type : expense.type) === "EXPENSE";
  const categories = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isOther = category === "OTHER";

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const dateFormatted = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(d);
      const timeFormatted = new Intl.DateTimeFormat("en-US", {
        timeStyle: "short",
      }).format(d);
      return { dateFormatted, timeFormatted };
    } catch {
      return { dateFormatted: dateStr, timeFormatted: "" };
    }
  };

  const { dateFormatted, timeFormatted } = formatDateTime(expense.transactionDate);

  const displayCategory =
    expense.category === "OTHER"
      ? expense.otherCategory || "Other"
      : CATEGORY_LABELS[expense.category] || expense.category;

  const isImageReceipt =
    expense.receiptMimeType?.startsWith("image/") ||
    expense.receiptKey?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  // Validation for Edit Form
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      errs.amount = "Please enter a valid positive amount";
    }
    if (!transactionDate) {
      errs.transactionDate = "Transaction date is required";
    }
    if (isOther && !otherCategory.trim()) {
      errs.otherCategory = "Please specify the custom category name";
    }
    if (receiptFile) {
      if (receiptFile.size > 5 * 1024 * 1024) {
        errs.receipt = "File must be smaller than 5 MB";
      }
      if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(receiptFile.type)) {
        errs.receipt = "Only PDF, JPG, PNG, or WebP files are allowed";
      }
    }
    return errs;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const formData = new FormData();
    formData.append("type", type);
    formData.append("category", category);
    if (isOther) {
      formData.append("otherCategory", otherCategory.trim());
    }
    formData.append("amount", amount);
    formData.append("currency", currency);
    formData.append("description", description.trim());
    formData.append("transactionDate", new Date(transactionDate).toISOString());
    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    try {
      await updateExpense({ id: expense.id, body: formData }).unwrap();
      setIsEditMode(false);
      await alert({
        title: "Entry Updated",
        message: "The office transaction details have been successfully updated in the ledger.",
        variant: "success",
      });
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to update entry. Please try again.";
      setErrors({ submit: msg });
      await alert({
        title: "Update Failed",
        message: msg,
        variant: "danger",
      });
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete Ledger Entry",
      message: `Are you sure you want to delete this ${
        expense.type === "EXPENSE" ? "expense" : "income"
      } entry of $${Number(expense.amount).toFixed(2)}?\nThis action will immediately update the ledger.`,
      confirmText: "Delete Entry",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (ok) {
      try {
        await deleteExpense(expense.id).unwrap();
        onClose();
        await alert({
          title: "Entry Deleted",
          message: "The transaction has been removed from the office financial ledger.",
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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setReceiptFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={!isUpdating && !isDeleting ? onClose : undefined}
      />

      {/* Modal Dialog with generous, comfortable width */}
      <div className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#EAE6DF] overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div
          className={`px-6 sm:px-8 pt-6 pb-5 transition-colors border-b ${
            isExpense
              ? "bg-gradient-to-r from-rose-50/80 via-orange-50/40 to-white border-rose-100"
              : "bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border-emerald-100"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-all ${
                  isExpense
                    ? "bg-rose-500 text-white shadow-rose-200"
                    : "bg-emerald-600 text-white shadow-emerald-200"
                }`}
              >
                {isExpense ? (
                  <TrendingDown className="h-6 w-6 stroke-[2.5]" />
                ) : (
                  <TrendingUp className="h-6 w-6 stroke-[2.5]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#0a0a0a] tracking-tight">
                    {isEditMode
                      ? `Edit ${type === "EXPENSE" ? "Expense" : "Income"} Entry`
                      : `Transaction Details`}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      isExpense
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {isEditMode ? type : expense.type}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Logged on {dateFormatted} at {timeFormatted} by{" "}
                  <span className="font-bold text-[#0a0a0a]">
                    {expense.createdBy?.name || "System"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {canEdit && !isEditMode && (
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-bold text-[#0a0a0a] hover:bg-[#FAF8F5] transition-all shadow-2xs cursor-pointer"
                  title="Edit transaction"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>Edit</span>
                </button>
              )}
              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-bold text-[#64748B] hover:text-[#0a0a0a] hover:bg-[#FAF8F5] transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating || isDeleting}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-[#64748B] hover:text-[#0a0a0a] hover:bg-black/5 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content: VIEW MODE vs EDIT MODE */}
        {!isEditMode ? (
          /* ── VIEW MODE ── */
          <div className="px-6 sm:px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Amount Banner */}
            <div
              className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                expense.type === "EXPENSE"
                  ? "bg-rose-50/60 border-rose-200/80"
                  : "bg-emerald-50/60 border-emerald-200/80"
              }`}
            >
              <div>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Transaction Amount ({expense.currency})
                </p>
                <p
                  className={`text-3xl font-mono font-black mt-1 ${
                    expense.type === "EXPENSE" ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {expense.type === "EXPENSE" ? "-" : "+"}$
                  {Number(expense.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Classification: <span className="font-bold text-[#0a0a0a]">{displayCategory}</span>
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white border border-[#EAE6DF] text-[#0a0a0a] shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Recorded in Ledger
                </span>
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category & Type */}
              <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
                  <Tag className="h-3.5 w-3.5 text-[#94A3B8]" />
                  <span>Category & Subtype</span>
                </div>
                <p className="text-sm font-black text-[#0a0a0a]">{displayCategory}</p>
                {expense.category === "OTHER" && expense.otherCategory && (
                  <p className="text-xs text-[#64748B]">
                    Custom Category:{" "}
                    <span className="font-semibold text-[#0a0a0a]">{expense.otherCategory}</span>
                  </p>
                )}
              </div>

              {/* Timing & Logged By */}
              <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
                  <Clock className="h-3.5 w-3.5 text-[#94A3B8]" />
                  <span>Transaction Date & Creator</span>
                </div>
                <p className="text-sm font-black text-[#0a0a0a]">
                  {dateFormatted}{" "}
                  <span className="text-xs font-mono font-medium text-[#64748B]">({timeFormatted})</span>
                </p>
                <p className="text-xs text-[#64748B]">
                  Logged by:{" "}
                  <span className="font-semibold text-[#0a0a0a]">
                    {expense.createdBy?.name || "System"}
                  </span>
                </p>
              </div>
            </div>

            {/* Full Description Card */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
                <FileText className="h-3.5 w-3.5 text-[#94A3B8]" />
                <span>Full Description / Particulars</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <p className="text-xs sm:text-sm text-[#0a0a0a] leading-relaxed whitespace-pre-wrap font-medium">
                  {expense.description || (
                    <span className="italic text-[#94A3B8]">
                      No written description provided for this transaction.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Cloudflare R2 Receipt / Proof Document Card */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
                  <Receipt className="h-3.5 w-3.5 text-[#94A3B8]" />
                  <span>Proof Document / Receipt</span>
                </div>
                {expense.receiptSignedUrl && (
                  <a
                    href={expense.receiptSignedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Open in Full Screen
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {expense.receiptSignedUrl ? (
                <div className="space-y-3">
                  {/* Image Preview if image */}
                  {isImageReceipt ? (
                    <div className="rounded-2xl border border-[#EAE6DF] overflow-hidden bg-[#FAF8F5] max-h-72 flex items-center justify-center p-2 group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={expense.receiptSignedUrl}
                        alt="Expense Receipt"
                        className="max-h-64 object-contain rounded-xl shadow-xs"
                      />
                      <a
                        href={expense.receiptSignedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5 rounded-2xl"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Click to Zoom / Open Original
                      </a>
                    </div>
                  ) : (
                    /* PDF / Document Card */
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-rose-600 shadow-2xs">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0a0a0a] truncate max-w-xs">
                            {expense.receiptName || "receipt-document.pdf"}
                          </p>
                          <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                            Cloudflare R2 Secure Storage · PDF Document
                          </p>
                        </div>
                      </div>
                      <a
                        href={expense.receiptSignedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] hover:bg-[#FAF8F5] shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 text-[#64748B]" />
                        Download / View
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#EAE6DF] bg-[#FAF8F5] text-center">
                  <p className="text-xs text-[#94A3B8] font-medium">
                    No receipt or proof document attached to this transaction.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── EDIT MODE ── */
          <form onSubmit={handleUpdate} className="px-6 sm:px-8 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Error banner */}
            {errors.submit && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-800 font-bold animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Type Switcher */}
            <div className="flex gap-2 p-1 bg-white/80 rounded-2xl border border-[#EAE6DF] shadow-2xs">
              {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      active
                        ? t === "EXPENSE"
                          ? "bg-rose-500 text-white shadow-sm shadow-rose-200"
                          : "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                        : "text-[#64748B] hover:text-[#0a0a0a] hover:bg-black/5"
                    }`}
                  >
                    {t === "EXPENSE" ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5" />
                    )}
                    {t === "EXPENSE" ? "Office Expense" : "Direct Income"}
                  </button>
                );
              })}
            </div>

            {/* ROW 1: Amount & Currency (Left) + Transaction Date (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-[#64748B]" />
                    Amount <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="flex rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] overflow-hidden focus-within:border-[#0a0a0a] focus-within:ring-2 focus-within:ring-[#0a0a0a]/5 transition-all">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="flex-1 h-10 px-3.5 text-sm font-mono font-black text-[#0a0a0a] bg-transparent focus:outline-none placeholder:text-[#94A3B8]"
                  />
                  <div className="relative border-l border-[#EAE6DF] bg-white">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-10 pl-3 pr-7 text-xs font-extrabold text-[#0a0a0a] bg-transparent focus:outline-none appearance-none cursor-pointer"
                    >
                      {["USD", "BDT", "CAD", "GBP", "EUR", "AUD"].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
                {errors.amount && (
                  <p className="mt-1 text-[10px] text-rose-600 font-bold">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                    Transaction Date <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] bg-[#FAF8F5] focus:outline-none focus:ring-2 transition-all focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]"
                />
                {errors.transactionDate && (
                  <p className="mt-1 text-[10px] text-rose-600 font-bold">{errors.transactionDate}</p>
                )}
              </div>
            </div>

            {/* ROW 2: Category & Custom Other */}
            <div className={`grid grid-cols-1 ${isOther ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-4`}>
              <div>
                <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[#64748B]" />
                    Category Classification <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as OfficeExpenseCategory)}
                    className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] appearance-none transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>

              {isOther && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Specify Other Category <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    placeholder="e.g. Courier service, Hardware, Office plant..."
                    maxLength={120}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#EAE6DF] text-xs font-medium text-[#0a0a0a] bg-[#FAF8F5] focus:outline-none focus:ring-2 transition-all focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]"
                  />
                  {errors.otherCategory && (
                    <p className="mt-1 text-[10px] text-rose-600 font-bold">{errors.otherCategory}</p>
                  )}
                </div>
              )}
            </div>

            {/* ROW 3: Description & Replace Receipt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                  Description & Particulars
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Notes about this transaction..."
                  className="w-full flex-1 p-3 rounded-xl border border-[#EAE6DF] text-xs text-[#0a0a0a] bg-[#FAF8F5] resize-none focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-[#64748B]" />
                    {expense.receiptSignedUrl ? "Replace Receipt Document" : "Attach Receipt Document"}
                  </span>
                </label>

                {receiptFile ? (
                  <div className="flex-1 flex flex-col justify-center p-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#0a0a0a] shadow-2xs">
                        <FileText className="h-5 w-5 text-[#64748B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0a0a0a] truncate">{receiptFile.name}</p>
                        <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                          {(receiptFile.size / 1024).toFixed(1)} KB · Ready to replace
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReceiptFile(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-50 text-[#94A3B8] hover:text-rose-600 transition-all cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 cursor-pointer flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 border-dashed transition-all ${
                      dragOver
                        ? "border-[#0a0a0a] bg-[#0a0a0a]/5"
                        : "border-[#EAE6DF] bg-[#FAF8F5] hover:border-[#0a0a0a]/40 hover:bg-white"
                    }`}
                  >
                    <Upload className="h-4 w-4 text-[#64748B]" />
                    <p className="text-xs text-[#64748B] font-medium text-center">
                      {expense.receiptSignedUrl ? "Drop new file to replace" : "Drop receipt here or browse"}
                    </p>
                    <p className="text-[10px] text-[#94A3B8]">PDF, JPG, PNG or WebP · Max 5 MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setReceiptFile(file);
                      }}
                    />
                  </div>
                )}
                {errors.receipt && (
                  <p className="mt-1 text-[10px] text-rose-600 font-bold">{errors.receipt}</p>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-[#FAF8F5] border-t border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Entry</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  disabled={isUpdating}
                  className="h-10 px-5 rounded-xl border-[#EAE6DF] text-[#0a0a0a] text-xs font-bold hover:bg-white cursor-pointer"
                >
                  Cancel Edit
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdate as any}
                  disabled={isUpdating}
                  className="h-10 px-6 rounded-xl bg-[#0a0a0a] hover:bg-black text-white text-xs font-black shadow-sm cursor-pointer transition-all"
                >
                  {isUpdating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={onClose}
                className="h-10 px-6 rounded-xl bg-[#0a0a0a] hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
