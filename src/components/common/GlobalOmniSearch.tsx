"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  User,
  CreditCard,
  Receipt,
  Briefcase,
  ArrowRight,
  Command,
  Loader2,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  useLazyOmniSearchQuery,
  ISearchResultItem,
  ISearchResponse,
} from "@/services/api/search/searchApi";
import { formatExplicitDate, formatCurrencyWithCode } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "client" | "case" | "invoice" | "receipt" | "payment";

interface GlobalOmniSearchProps {
  compact?: boolean;
}

export function GlobalOmniSearch({ compact = false }: GlobalOmniSearchProps) {
  const router = useRouter();
  const { isClientAccount } = usePermissions();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsContainerRef = React.useRef<HTMLDivElement>(null);

  const [triggerSearch, { data, isFetching }] = useLazyOmniSearchQuery();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search trigger
  React.useEffect(() => {
    if (!searchTerm.trim()) return;
    const timer = setTimeout(() => {
      triggerSearch(searchTerm.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, triggerSearch]);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setSelectedIndex(0);
    } else {
      setSearchTerm("");
      setActiveTab("all");
    }
  }, [isOpen]);

  const hasQuery = searchTerm.trim().length > 0;

  // Stale cache guard: when input is blank, counts and results must be 0
  const searchData: ISearchResponse = React.useMemo(() => {
    if (!hasQuery || !data?.data) {
      return {
        clients: [],
        cases: [],
        payments: [],
        invoices: [],
        receipts: [],
        totalMatches: 0,
      };
    }
    return data.data;
  }, [hasQuery, data]);

  // Filter items based on active tab
  const allFilteredItems: ISearchResultItem[] = React.useMemo(() => {
    if (!hasQuery) return [];
    if (activeTab === "client") return isClientAccount ? [] : searchData.clients;
    if (activeTab === "case") return searchData.cases;
    if (activeTab === "invoice") return searchData.invoices;
    if (activeTab === "receipt") return searchData.receipts;
    if (activeTab === "payment") return searchData.payments;
    return [
      ...(isClientAccount ? [] : searchData.clients),
      ...searchData.cases,
      ...searchData.invoices,
      ...searchData.receipts,
      ...searchData.payments,
    ];
  }, [hasQuery, searchData, activeTab, isClientAccount]);

  // Keyboard navigation within results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < allFilteredItems.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allFilteredItems.length - 1));
    } else if (e.key === "Enter" && allFilteredItems[selectedIndex]) {
      e.preventDefault();
      navigateTo(allFilteredItems[selectedIndex].url);
    }
  };

  const navigateTo = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "client":
        return <User className="h-4 w-4 text-blue-500" />;
      case "case":
        return <Briefcase className="h-4 w-4 text-amber-500" />;
      case "invoice":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "receipt":
        return <Receipt className="h-4 w-4 text-emerald-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-teal-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const tabs = [
    { id: "all", label: "All Results", count: searchData.totalMatches },
    ...(!isClientAccount ? [{ id: "client", label: "Clients", count: searchData.clients.length }] : []),
    { id: "case", label: isClientAccount ? "My Cases" : "Cases", count: searchData.cases.length },
    { id: "invoice", label: "Invoices", count: searchData.invoices.length },
    { id: "receipt", label: "Receipts", count: searchData.receipts.length },
    { id: "payment", label: "Payments", count: searchData.payments.length },
  ];

  return (
    <>
      {/* 1. COMPACT TRIGGER (MOBILE / TABLET) */}
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Search records"
          title="Search (Ctrl+K)"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A712]"
        >
          <Search className="h-4 w-4" />
        </button>
      ) : (
        /* 2. DESKTOP CENTER SEARCH BAR (BALANCED & PROPORTIONAL) */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Search records (Ctrl+K)"
          className="w-full flex items-center justify-between h-9.5 px-3 rounded-xl border border-border/80 bg-background/70 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A712] shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
            <Search className="h-4 w-4 text-muted-foreground/70 shrink-0 group-hover:text-[#F3A712] transition-colors" />
            <span className="truncate">
              {isClientAccount ? "Search your cases, invoices, receipts..." : "Search client, case, invoice, ref, status..."}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground bg-muted border border-border/80 rounded-md shrink-0 shadow-2xs">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </kbd>
        </button>
      )}

      {/* 3. MODAL DIALOG RENDERED VIA PORTAL TO BODY (COVERS HEADER & SIDEBAR) */}
      {isOpen && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global Omni Search"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-3 zoom-in-[0.98] duration-150 text-foreground"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-border bg-muted/40">
              <Search className="h-5 w-5 text-muted-foreground shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                role="searchbox"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  isClientAccount
                    ? "Search your private invoices, receipts, payments, case..."
                    : "Search client name/ID, email, phone, service, invoice #, receipt #, ref, status..."
                }
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
              />
              {isFetching && <Loader2 className="h-4 w-4 animate-spin text-[#F3A712] mr-2" />}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search input"
                  className="p-1 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
                className="ml-2 px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted border border-border/70 rounded-lg cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Strict Client Privacy Banner */}
            {isClientAccount && (
              <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Private Client Portal Search - strictly isolated to your personal account.</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-500/15 rounded text-emerald-700 dark:text-emerald-300">
                  Protected
                </span>
              </div>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-muted/20 border-b border-border/70 overflow-x-auto text-xs font-semibold scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as FilterTab);
                    setSelectedIndex(0);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 font-bold",
                    activeTab === tab.id
                      ? "bg-[#0a0a0a] text-[#F3A712] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  {tab.label}
                  {hasQuery && tab.count > 0 && (
                    <span
                      className={cn(
                        "ml-1.5 px-1.5 py-0.2 rounded-full text-[10px]",
                        activeTab === tab.id
                          ? "bg-[#F3A712] text-black"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            <div
              ref={resultsContainerRef}
              role="listbox"
              aria-label="Search results"
              className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[55vh]"
            >
              {!hasQuery ? (
                <div className="py-12 px-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F3A712]/15 text-[#F3A712] flex items-center justify-center mb-3 shadow-2xs">
                    <Search className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {isClientAccount ? "Search Your Portal Records" : "Omni-Search AdSkill Records"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                    {isClientAccount
                      ? "Search your private invoices, payment receipts, case milestones, and installment schedules."
                      : "Search instantly across client names, IDs (e.g. ASK-2026), phone numbers, services, invoices, receipts, and wire references."}
                  </p>
                </div>
              ) : allFilteredItems.length === 0 && !isFetching ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-sm font-bold text-foreground">No matching records found</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                    No results found for &ldquo;<span className="font-semibold text-foreground">{searchTerm}</span>&rdquo;. Check spelling or try searching by ID, date, or reference.
                  </p>
                </div>
              ) : (
                allFilteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => navigateTo(item.url)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 border",
                        isSelected
                          ? "bg-[#F3A712]/10 border-[#F3A712]/40 shadow-2xs"
                          : "border-transparent hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                            isSelected
                              ? "bg-background border-[#F3A712]/40 shadow-2xs"
                              : "bg-muted/70 border-border/70",
                          )}
                        >
                          {getItemIcon(item.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                  item.badge === "VERIFIED" || item.badge === "PAID" || item.badge === "COMPLETED"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : item.badge === "PENDING" || item.badge === "INTAKE"
                                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {item.subtitle}
                          </div>

                          {/* Extra Metadata tags */}
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            {item.details?.clientId && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-foreground">
                                ID: {item.details.clientId}
                              </span>
                            )}
                            {item.details?.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5 text-muted-foreground/60" />
                                {item.details.phone}
                              </span>
                            )}
                            {item.details?.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-2.5 w-2.5 text-muted-foreground/60" />
                                {item.details.email}
                              </span>
                            )}
                            {item.details?.consultantName && (
                              <span className="text-muted-foreground">
                                Consultant: <strong className="font-semibold text-foreground">{item.details.consultantName}</strong>
                              </span>
                            )}
                            {item.date && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5 text-muted-foreground/60" />
                                {formatExplicitDate(item.date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Amount / CTA */}
                      <div className="flex items-center gap-2.5 pl-3 shrink-0">
                        {item.amount && (
                          <div className="text-right">
                            <div className="text-xs font-black text-foreground">
                              {formatCurrencyWithCode(item.amount, item.currency)}
                            </div>
                          </div>
                        )}
                        <ArrowRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isSelected
                              ? "text-[#F3A712] translate-x-0.5"
                              : "text-muted-foreground/40 group-hover:text-foreground",
                          )}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/40 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono text-[10px]">↑</kbd>
                  <kbd className="ml-1 px-1.5 py-0.5 rounded border border-border bg-background font-mono text-[10px]">↓</kbd> to navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono text-[10px]">Enter</kbd> to select
                </span>
              </div>
              <span className="font-medium">
                {hasQuery
                  ? `${searchData.totalMatches} result${searchData.totalMatches === 1 ? "" : "s"}`
                  : "Type to search"}
              </span>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}