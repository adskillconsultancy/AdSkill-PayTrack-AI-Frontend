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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useConfirm } from "@/hooks/useConfirm";
import {
  useCreateExpenseMutation,
  type OfficeExpenseCategory,
  type TransactionType,
} from "@/services/api/expenses/expensesApi";

// ── Category definitions ──────────────────────────────────────────────────────

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

// Quick 1-click presets for rapid logging
const EXPENSE_QUICK_PRESETS: {
  label: string;
  category: OfficeExpenseCategory;
  defaultDesc: string;
}[] = [
  { label: "🍵 Tea & Snacks", category: "MEALS_ENTERTAINMENT", defaultDesc: "Office tea and refreshments" },
  { label: "📦 Supplies", category: "OFFICE_SUPPLIES", defaultDesc: "Office supplies & stationery" },
  { label: "🚖 Transport", category: "TRAVEL", defaultDesc: "Office transport & commute" },
  { label: "💡 Utilities", category: "UTILITIES", defaultDesc: "Office utility bill" },
];

const INCOME_QUICK_PRESETS: {
  label: string;
  category: OfficeExpenseCategory;
  defaultDesc: string;
}[] = [
  { label: "💼 Service Fee", category: "SERVICE_REVENUE", defaultDesc: "Client service payment" },
  { label: "🤝 Referral", category: "REFERRAL_FEE", defaultDesc: "Referral commission" },
  { label: "📈 Retainer", category: "RETAINER", defaultDesc: "Monthly retainer payment" },
  { label: "💵 Misc Cash", category: "MISCELLANEOUS_INCOME", defaultDesc: "Miscellaneous cash receipt" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateExpenseModal({
  isOpen,
  onClose,
  defaultType = "EXPENSE",
}: CreateExpenseModalProps) {
  const [createExpense, { isLoading }] = useCreateExpenseMutation();
  const { alert } = useConfirm();

  const [type, setType] = React.useState<TransactionType>(defaultType);
  const [category, setCategory] = React.useState<OfficeExpenseCategory>("MEALS_ENTERTAINMENT");
  const [otherCategory, setOtherCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [description, setDescription] = React.useState("");
  const [transactionDate, setTransactionDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [success, setSuccess] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync state when opening
  React.useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setCategory(defaultType === "EXPENSE" ? "MEALS_ENTERTAINMENT" : "SERVICE_REVENUE");
      setOtherCategory("");
      setAmount("");
      setCurrency("USD");
      setDescription("");
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setReceiptFile(null);
      setErrors({});
      setSuccess(false);
    }
  }, [isOpen, defaultType]);

  // Adjust category when toggling type
  React.useEffect(() => {
    if (type === "EXPENSE") {
      setCategory("MEALS_ENTERTAINMENT");
    } else {
      setCategory("SERVICE_REVENUE");
    }
    setOtherCategory("");
  }, [type]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const categories = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const quickPresets = type === "EXPENSE" ? EXPENSE_QUICK_PRESETS : INCOME_QUICK_PRESETS;
  const isOther = category === "OTHER";

  const handleApplyPreset = (preset: (typeof quickPresets)[0]) => {
    setCategory(preset.category);
    if (!description.trim()) {
      setDescription(preset.defaultDesc);
    }
  };

  // Validation
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (description.trim()) {
      formData.append("description", description.trim());
    }
    formData.append("transactionDate", new Date(transactionDate).toISOString());
    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    try {
      await createExpense(formData).unwrap();
      onClose();
      await alert({
        title: `${type === "EXPENSE" ? "Expense" : "Income"} Recorded`,
        message: `Successfully logged $${Number(amount).toFixed(2)} ${currency} ${
          type === "EXPENSE" ? "office expense" : "direct income"
        } into the financial ledger.`,
        variant: "success",
      });
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || "Failed to record transaction. Please check your inputs and try again.";
      setErrors({ submit: errorMessage });
      await alert({
        title: "Submission Error",
        message: errorMessage,
        variant: "danger",
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setReceiptFile(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog with comfortable wider footprint */}
      <div className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#EAE6DF] overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div
          className={`px-6 sm:px-8 pt-6 pb-5 transition-colors border-b ${
            type === "EXPENSE"
              ? "bg-gradient-to-r from-rose-50/80 via-orange-50/40 to-white border-rose-100"
              : "bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border-emerald-100"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-all ${
                  type === "EXPENSE"
                    ? "bg-rose-500 text-white shadow-rose-200"
                    : "bg-emerald-600 text-white shadow-emerald-200"
                }`}
              >
                {type === "EXPENSE" ? (
                  <TrendingDown className="h-6 w-6 stroke-[2.5]" />
                ) : (
                  <TrendingUp className="h-6 w-6 stroke-[2.5]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#0a0a0a] tracking-tight">
                    Record New {type === "EXPENSE" ? "Expense" : "Income"}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      type === "EXPENSE"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {type}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {type === "EXPENSE"
                    ? "Log an office purchase, tea/refreshments, utility, or operational expense"
                    : "Log service fees, retainers, client payments, or other cash income"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#64748B] hover:text-[#0a0a0a] hover:bg-black/5 transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Type Switcher Pills */}
          <div className="mt-4 flex gap-2 p-1 bg-white/80 rounded-2xl border border-[#EAE6DF] shadow-2xs">
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

          {/* Quick preset suggestions */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1 mr-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Quick:
            </span>
            {quickPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  category === preset.category
                    ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-2xs"
                    : "bg-white text-[#475569] border-[#EAE6DF] hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body with Multi-Column Spacious Layout */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-5 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Success Banner */}
          {success && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs sm:text-sm text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Transaction recorded successfully! Updating ledger...</span>
            </div>
          )}

          {/* Error banner */}
          {errors.submit && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-800 font-bold animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* ROW 1: Amount & Currency (Left) + Transaction Date (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount & Currency Split */}
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
                  className={`flex-1 h-10 px-3.5 text-sm font-mono font-black text-[#0a0a0a] bg-transparent focus:outline-none placeholder:text-[#94A3B8] ${
                    errors.amount ? "bg-rose-50/50" : ""
                  }`}
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

            {/* Transaction Date */}
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
                max={new Date().toISOString().slice(0, 10)}
                className={`w-full h-10 px-3.5 rounded-xl border text-xs font-bold text-[#0a0a0a] bg-[#FAF8F5] focus:outline-none focus:ring-2 transition-all ${
                  errors.transactionDate
                    ? "border-rose-400 focus:ring-rose-200 bg-rose-50/50"
                    : "border-[#EAE6DF] focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]"
                }`}
              />
              {errors.transactionDate && (
                <p className="mt-1 text-[10px] text-rose-600 font-bold">{errors.transactionDate}</p>
              )}
            </div>
          </div>

          {/* ROW 2: Category & Other custom specification */}
          <div className={`grid grid-cols-1 ${isOther ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-4`}>
            {/* Category selector */}
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

            {/* Custom Category input when "OTHER" is picked */}
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
                  placeholder="e.g. Courier service, Hardware spare, Office flowers..."
                  maxLength={120}
                  className={`w-full h-10 px-3.5 rounded-xl border text-xs font-medium text-[#0a0a0a] bg-[#FAF8F5] focus:outline-none focus:ring-2 transition-all ${
                    errors.otherCategory
                      ? "border-rose-400 focus:ring-rose-200 bg-rose-50/50"
                      : "border-[#EAE6DF] focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a]"
                  }`}
                />
                {errors.otherCategory && (
                  <p className="mt-1 text-[10px] text-rose-600 font-bold">{errors.otherCategory}</p>
                )}
              </div>
            )}
          </div>

          {/* ROW 3: Description (Left) + Receipt Upload (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Description Notes */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                <span>Description & Particulars</span>{" "}
                <span className="font-normal text-[#94A3B8] text-[11px]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="e.g. Afternoon tea & biscuits for team meeting, bought from convenience store..."
                className="w-full flex-1 p-3 rounded-xl border border-[#EAE6DF] text-xs text-[#0a0a0a] bg-[#FAF8F5] resize-none focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 focus:border-[#0a0a0a] transition-all"
              />
            </div>

            {/* Receipt / Invoice Upload */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-[#0a0a0a] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-[#64748B]" />
                  Receipt / Proof Document{" "}
                  <span className="font-normal text-[#94A3B8] text-[11px]">(optional)</span>
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
                        {(receiptFile.size / 1024).toFixed(1)} KB · {receiptFile.type || "Document"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptFile(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-50 text-[#94A3B8] hover:text-rose-600 transition-all cursor-pointer"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Ready to store in Cloudflare R2
                  </p>
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
                      : errors.receipt
                      ? "border-rose-300 bg-rose-50/50"
                      : "border-[#EAE6DF] bg-[#FAF8F5] hover:border-[#0a0a0a]/40 hover:bg-white"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#EAE6DF] text-[#64748B] shadow-2xs">
                    <Upload className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-[#64748B] font-medium text-center">
                    Drag receipt here or{" "}
                    <span className="text-[#0a0a0a] font-bold underline underline-offset-2">
                      browse
                    </span>
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

        {/* Footer Actions with Live Summary */}
        <div className="px-6 sm:px-8 py-4 bg-[#FAF8F5] border-t border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Quick Summary Pill */}
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="font-semibold">Entry:</span>
            <span
              className={`font-mono font-black px-2 py-0.5 rounded-md border ${
                type === "EXPENSE"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {amount ? `${type === "EXPENSE" ? "-" : "+"}${Number(amount).toFixed(2)} ${currency}` : "$0.00"}
            </span>
            <span className="text-[10px] text-[#94A3B8]">
              {transactionDate ? `(${transactionDate})` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-10 px-5 rounded-xl border-[#EAE6DF] text-[#0a0a0a] text-xs font-bold hover:bg-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit as any}
              disabled={isLoading || success}
              className={`h-10 px-6 rounded-xl text-white text-xs font-black shadow-sm cursor-pointer transition-all ${
                type === "EXPENSE"
                  ? "bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 shadow-rose-200"
                  : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 shadow-emerald-200"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : success ? (
                "✓ Saved!"
              ) : (
                `Save ${type === "EXPENSE" ? "Expense" : "Income"}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
