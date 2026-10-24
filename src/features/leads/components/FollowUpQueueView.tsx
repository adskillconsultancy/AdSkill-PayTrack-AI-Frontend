"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Users,
  ChevronRight,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Building,
  User,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import {
  useGetFollowUpQueueQuery,
} from "@/services/api/leads/leadsApi";
import { useGetUsersQuery } from "@/services/api/users/usersApi";
import { useAuth } from "@/hooks/useAuth";
import { cn, formatExplicitDate } from "@/lib/utils";
import type {
  FollowUpQueueLead,
  FollowUpUrgency,
} from "../types";
import { CompleteFollowUpModal } from "./CompleteFollowUpModal";

interface FollowUpQueueViewProps {
  pageTitle?: string;
  parentBreadcrumb?: string;
}

export function FollowUpQueueView({
  pageTitle = "Follow-Up Reminder Queue",
  parentBreadcrumb = "CRM & Pipeline",
}: FollowUpQueueViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const roleName = typeof user?.role === "string" ? user?.role : user?.role?.name;
  const isSuperAdminOrAdmin =
    roleName === "SUPER_ADMIN" || roleName === "ADMIN";

  // State
  const [selectedUrgency, setSelectedUrgency] =
    React.useState<FollowUpUrgency>("ALL");
  // Default to "MY" for staff, "ALL" for super admin/admin
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>(
    isSuperAdminOrAdmin ? "ALL" : (user?.id ? "MY" : "ALL")
  );
  const [selectedSort, setSelectedSort] = React.useState("Newest First");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15;

  // Modals state
  const [selectedLeadForCompletion, setSelectedLeadForCompletion] =
    React.useState<FollowUpQueueLead | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] =
    React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch staff list for dropdown for all staff members
  const { data: usersResponse } = useGetUsersQuery(
    { page: 1, limit: 100, excludeRoleName: "CLIENT" }
  );
  const staffList = (usersResponse?.data as any[]) || [];

  // Sort parameter mapping
  const { sortBy, sortOrder } = React.useMemo(() => {
    switch (selectedSort) {
      case "Oldest First":
        return { sortBy: "createdAt", sortOrder: "asc" as const };
      case "Follow-Up Date":
        return { sortBy: "nextFollowUpDate", sortOrder: "asc" as const };
      case "Name (A-Z)":
        return { sortBy: "fullName", sortOrder: "asc" as const };
      case "Newest First":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" as const };
    }
  }, [selectedSort]);

  // Fetch follow-up queue
  const queryParams = React.useMemo(() => {
    const effectiveStaffId =
      selectedStaffId === "MY"
        ? user?.id
        : selectedStaffId !== "ALL"
        ? selectedStaffId
        : undefined;

    return {
      page: currentPage,
      limit: pageSize,
      urgency: selectedUrgency !== "ALL" ? selectedUrgency : undefined,
      assignedToId: effectiveStaffId,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    };
  }, [currentPage, selectedUrgency, selectedStaffId, user?.id, debouncedSearch, sortBy, sortOrder]);

  const {
    data: queueResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetFollowUpQueueQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const queueData = queueResponse?.data;
  const items = queueData?.items || [];
  const meta = queueResponse?.meta;
  const counts = queueData?.counts || {
    overdue: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    total: 0,
  };
  const totalItems =
    meta?.total ??
    (selectedUrgency === "OVERDUE"
      ? counts.overdue
      : selectedUrgency === "TODAY"
      ? counts.today
      : selectedUrgency === "UPCOMING"
      ? counts.upcoming
      : selectedUrgency === "COMPLETED"
      ? (counts.completed ?? 0)
      : counts.total);
  const totalPages =
    meta?.totalPage ?? Math.max(1, Math.ceil(totalItems / pageSize));

  const handleCopyPhone = (e: React.MouseEvent, phone: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCompletion = (
    e: React.MouseEvent,
    lead: FollowUpQueueLead,
  ) => {
    e.stopPropagation();
    setSelectedLeadForCompletion(lead);
    setIsCompletionModalOpen(true);
  };

  // Helper for rendering urgency badge
  const renderUrgencyBadge = (lead: FollowUpQueueLead) => {
    const dueDate = lead.nextFollowUpDate
      ? new Date(lead.nextFollowUpDate)
      : null;
    const formattedDate = dueDate
      ? dueDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "No Date";
    const formattedTime = dueDate
      ? dueDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

    if (lead.urgency === "COMPLETED" || lead.isFollowUpDone) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 w-fit rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 text-[11px] font-bold">
            <CheckCircle2 className="h-3 w-3" />
            Done / Completed
          </span>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {lead.lastFollowUpAt
              ? `Done ${formatExplicitDate(lead.lastFollowUpAt)}`
              : "Follow-Up Done"}
          </span>
        </div>
      );
    }

    if (lead.urgency === "OVERDUE") {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 w-fit rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-2.5 py-0.5 text-[11px] font-bold">
            <Flame className="h-3 w-3" />
            Overdue
          </span>
          <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
            {dueDate
              ? `${formattedDate} ${formattedTime && `at ${formattedTime}`}`
              : "Follow-Up Pending"}
          </span>
        </div>
      );
    }

    if (lead.urgency === "TODAY") {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 w-fit rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-0.5 text-[11px] font-bold">
            <Clock className="h-3 w-3" />
            Due Today
          </span>
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
            {formattedTime || "Pending Contact"}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 w-fit rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 px-2.5 py-0.5 text-[11px] font-bold">
          <Calendar className="h-3 w-3" />
          Upcoming
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          {formattedDate} {formattedTime && `at ${formattedTime}`}
        </span>
      </div>
    );
  };

  // Table columns definition
  const columns: ColumnDef<FollowUpQueueLead>[] = [
    {
      key: "date",
      header: "Date",
      accessorKey: "createdAt",
      className: "w-[120px]",
      cell: (lead) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <div className="text-xs font-bold text-foreground">
            {formatExplicitDate(lead.createdAt)}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            <span>Added</span>
          </div>
        </div>
      ),
    },
    {
      key: "urgency",
      header: "Urgency / Due",
      accessorKey: "nextFollowUpDate",
      className: "w-[150px]",
      cell: (lead) => renderUrgencyBadge(lead),
    },
    {
      key: "contact",
      header: "Lead Contact",
      accessorKey: "fullName",
      cell: (lead) => {
        const rawPhone = lead.phone || "";
        const cleanedPhone = rawPhone.replace(/[^0-9]/g, "");
        const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
          `Hello ${lead.fullName}, this is ${
            user?.name || "AdSkill"
          } from AdSkill Consultancy following up regarding your inquiry.`,
        )}`;

        return (
          <div className="space-y-1">
            <Link
              href={`/leads/${lead.id}`}
              className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group">
              <span>{lead.fullName}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium">{lead.phone}</span>
              <button
                type="button"
                onClick={(e) => handleCopyPhone(e, lead.phone, lead.id)}
                title="Copy phone"
                className="hover:text-foreground">
                {copiedId === lead.id ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {lead.country && <span>• {lead.country}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: "service",
      header: "Service Offering",
      accessorKey: "service",
      cell: (lead) => (
        <div className="text-xs">
          {lead.service?.name ? (
            <span className="font-semibold text-foreground">
              {lead.service.name}
            </span>
          ) : (
            <span className="text-muted-foreground italic">General Inquiry</span>
          )}
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned Staff",
      accessorKey: "assignedTo",
      cell: (lead) => (
        <div className="text-xs">
          {lead.assignedTo?.name ? (
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {lead.assignedTo.name.charAt(0)}
              </div>
              <div>
                <span className="font-medium text-foreground block">
                  {lead.assignedTo.name}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-amber-600 text-[11px] font-semibold bg-amber-50 px-2 py-0.5 rounded">
              Unassigned
            </span>
          )}
        </div>
      ),
    },
    {
      key: "lastActivity",
      header: "Last Interaction / Remarks",
      accessorKey: "lastActivity",
      cell: (lead) => {
        const lastAct = lead.lastActivity;
        return (
          <div className="max-w-xs text-xs space-y-0.5">
            {lastAct ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    {lastAct.activityType}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    • {formatExplicitDate(lastAct.createdAt)}
                  </span>
                </div>
                <p className="text-foreground line-clamp-2 text-[11px]">
                  {lastAct.notes || "Interaction logged."}
                </p>
              </>
            ) : (
              <span className="text-muted-foreground italic text-[11px]">
                No interactions logged yet
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Quick Actions",
      className: "text-right w-[200px]",
      cell: (lead) => {
        const rawPhone = lead.phone || "";
        const cleanedPhone = rawPhone.replace(/[^0-9]/g, "");
        const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
          `Hello ${lead.fullName}, this is ${
            user?.name || "AdSkill"
          } from AdSkill Consultancy following up regarding your inquiry.`,
        )}`;

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}>
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors">
              <MessageSquare className="h-4 w-4" />
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${lead.phone}`}
              title="Direct Phone Call"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors">
              <Phone className="h-4 w-4 text-primary" />
            </a>

            {/* Mark Done / Reschedule Button */}
            {lead.isFollowUpDone ? (
              <button
                type="button"
                onClick={(e) => handleOpenCompletion(e, lead)}
                title="Schedule Next Follow-Up / Update Remarks"
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors cursor-pointer">
                <Calendar className="h-3.5 w-3.5" />
                <span>Reschedule</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => handleOpenCompletion(e, lead)}
                title="Mark Follow-Up Completed"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors cursor-pointer">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Done</span>
              </button>
            )}

            {/* Open Dossier */}
            <Link
              href={`/leads/${lead.id}`}
              title="View Dossier"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors">
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-2">
          <Link
            href="/leads"
            className="hover:text-foreground transition-colors">
            {parentBreadcrumb}
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">
            Follow-Up Reminder Queue
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {pageTitle}
              </h1>
              {counts.overdue > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-2.5 py-0.5 text-xs font-bold animate-pulse">
                  <Flame className="h-3.5 w-3.5" />
                  {counts.overdue} Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Priority queue of prospective client leads due for scheduled contact and status reviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl h-9 px-3 gap-1.5 text-xs">
              <RefreshCw
                className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
              />
              <span>Refresh</span>
            </Button>
            <Link href="/leads">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 px-3.5 text-xs font-semibold">
                Back to All Leads
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Urgency Summary Cards / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Overdue Card */}
        <button
          type="button"
          onClick={() => {
            setSelectedUrgency(
              selectedUrgency === "OVERDUE" ? "ALL" : "OVERDUE",
            );
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-2xl border p-4 text-left transition-all cursor-pointer relative overflow-hidden",
            selectedUrgency === "OVERDUE"
              ? "border-red-500 bg-red-500/10 shadow-sm ring-2 ring-red-500/20"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Overdue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {counts.overdue}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Requires immediate contact
          </p>
        </button>

        {/* Due Today Card */}
        <button
          type="button"
          onClick={() => {
            setSelectedUrgency(selectedUrgency === "TODAY" ? "ALL" : "TODAY");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-2xl border p-4 text-left transition-all cursor-pointer relative overflow-hidden",
            selectedUrgency === "TODAY"
              ? "border-amber-500 bg-amber-500/10 shadow-sm ring-2 ring-amber-500/20"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Due Today
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {counts.today}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Follow up today
          </p>
        </button>

        {/* Upcoming Card */}
        <button
          type="button"
          onClick={() => {
            setSelectedUrgency(
              selectedUrgency === "UPCOMING" ? "ALL" : "UPCOMING",
            );
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-2xl border p-4 text-left transition-all cursor-pointer relative overflow-hidden",
            selectedUrgency === "UPCOMING"
              ? "border-blue-500 bg-blue-500/10 shadow-sm ring-2 ring-blue-500/20"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Upcoming
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {counts.upcoming}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Scheduled later
          </p>
        </button>

        {/* Completed Follow-Ups Card */}
        <button
          type="button"
          onClick={() => {
            setSelectedUrgency(
              selectedUrgency === "COMPLETED" ? "ALL" : "COMPLETED",
            );
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-2xl border p-4 text-left transition-all cursor-pointer relative overflow-hidden",
            selectedUrgency === "COMPLETED"
              ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/20"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Completed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {counts.completed ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Marked as done
          </p>
        </button>

        {/* All Assigned Leads Card */}
        <button
          type="button"
          onClick={() => {
            setSelectedUrgency("ALL");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-2xl border p-4 text-left transition-all cursor-pointer relative overflow-hidden",
            selectedUrgency === "ALL"
              ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              All Assigned
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {counts.total}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total assigned leads
          </p>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lead by name, phone..."
            className="w-full rounded-xl border border-border/80 bg-background pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Staff Filter Dropdown (Available for everyone: My Assigned first, then All, then specific staff) */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-52 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary">
              {user?.id && <option value="MY">My Assigned Follow-Ups</option>}
              <option value="ALL">All Staff Members</option>
              <option value="UNASSIGNED">Unassigned Leads</option>
              {staffList
                .filter((st) => st.id !== user?.id)
                .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role?.name || "Staff"})
                  </option>
                ))}
            </select>
          </div>

          {/* Active Urgency Pill Indicator */}
          {selectedUrgency !== "ALL" && (
            <button
              type="button"
              onClick={() => setSelectedUrgency("ALL")}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/50 hover:bg-muted px-2.5 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer">
              <span>Filter: {selectedUrgency}</span>
              <span className="text-muted-foreground hover:text-foreground">×</span>
            </button>
          )}
        </div>
      </div>

      {/* DataTable matching ServiceListView standard */}
      <DataTable<FollowUpQueueLead>
        title="FOLLOW-UP QUEUE"
        columns={columns}
        data={items}
        isLoading={isLoading || isFetching}
        keyExtractor={(lead) => lead.id}
        totalCount={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        itemLabel="leads"
        sortBy={selectedSort}
        sortOptions={[
          "Newest First",
          "Oldest First",
          "Follow-Up Date",
          "Name (A-Z)",
        ]}
        onSortChange={(sort) => {
          setSelectedSort(sort);
          setCurrentPage(1);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(lead) => router.push(`/leads/${lead.id}`)}
        emptyTitle="No leads requiring follow-up"
        emptyDescription="No leads currently match this filter criteria."
      />

      {/* Completion Modal */}
      <CompleteFollowUpModal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setSelectedLeadForCompletion(null);
        }}
        lead={selectedLeadForCompletion}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
