"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatExplicitDate } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import {
  useGetLeadsQuery,
  useGetLeadSummaryStatsQuery,
  useDeleteLeadMutation,
} from "@/services/api/leads/leadsApi";
import { useGetServicesQuery } from "@/services/api/services/servicesApi";
import { useGetUsersQuery } from "@/services/api/users/usersApi";
import type { BackendLead, LeadStatus } from "../types";
import { LeadMetricCards } from "./LeadMetricCards";
import { LeadSearchBar } from "./LeadSearchBar";
import { CreateLeadModal } from "./CreateLeadModal";
import { LeadActivityDrawer } from "./LeadActivityDrawer";
import { useConfirm } from "@/hooks/useConfirm";
import {
  Phone,
  MessageSquare,
  UserPlus,
  ChevronRight,
  Eye,
  Trash2,
  RefreshCw,
  Copy,
  Clock,
  ShieldAlert,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTES } from "@/constants";

interface LeadListViewProps {
  pageTitle?: string;
  categoryLabel?: string;
  parentBreadcrumb?: string;
}

const statusClass: Record<LeadStatus, string> = {
  NEW: "bg-[#EBF8FF] text-[#0284C7] border border-[#BAE6FD]",
  CONTACTED: "bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]",
  IN_PROGRESS: "bg-[#E0E7FF] text-[#4338CA] border border-[#C7D2FE]",
  FOLLOW_UP: "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]",
  DOCUMENTS_PENDING: "bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]",
  MEETING_SCHEDULED: "bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC]",
  QUALIFIED: "bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]",
  ENGAGED: "bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]",
  CONVERTED: "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
  LOST: "bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]",
  NOT_INTERESTED: "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]",
};

const statusLabel: Record<LeadStatus, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In Discussion",
  FOLLOW_UP: "Follow-Up Required",
  DOCUMENTS_PENDING: "Documents Pending",
  MEETING_SCHEDULED: "Meeting Scheduled",
  QUALIFIED: "Qualified",
  ENGAGED: "Converted - Engaged",
  CONVERTED: "Closed - Won",
  LOST: "Closed - Lost",
  NOT_INTERESTED: "Not Interested",
};

const assessmentBadgeClass = (assessment?: string | null) => {
  if (!assessment) return "bg-slate-100 text-slate-600 border-slate-200";
  if (assessment.includes("Strong")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (assessment.includes("Moderate")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (assessment.includes("Weak")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (assessment.includes("Review")) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-sky-50 text-sky-700 border-sky-200";
};

const priorityBadgeClass = (priority?: string | null) => {
  const p = (priority || "MEDIUM").toUpperCase();
  if (p === "HIGH") return "bg-red-50 text-red-700 border-red-200 font-bold";
  if (p === "LOW") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};


export function LeadListView({
  pageTitle = "Leads Management",
  categoryLabel = "ALL LEADS PIPELINE",
  parentBreadcrumb = "CRM & Pipeline",
}: LeadListViewProps) {
  const router = useRouter();
  const { confirm, alert } = useConfirm();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<LeadStatus | "ALL">("ALL");
  const [serviceFilter, setServiceFilter] = React.useState<string>("ALL");
  const [assignedFilter, setAssignedFilter] = React.useState<string>("ALL");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [selectedSort, setSelectedSort] = React.useState("Newest First");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sort parameter mapping
  const { sortBy, sortOrder } = React.useMemo(() => {
    switch (selectedSort) {
      case "Oldest First":
        return { sortBy: "createdAt", sortOrder: "asc" as const };
      case "Name (A-Z)":
        return { sortBy: "fullName", sortOrder: "asc" as const };
      case "Name (Z-A)":
        return { sortBy: "fullName", sortOrder: "desc" as const };
      case "Newest First":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" as const };
    }
  }, [selectedSort]);

  const { user, isSuperAdmin, isStaffAccount } = usePermissions();
  const canAccessLeads = isSuperAdmin || isStaffAccount;

  // 1. Fetch live leads
  const {
    data: leadsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetLeadsQuery(
    {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter,
      serviceId: serviceFilter,
      assignedToId: assignedFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortOrder,
    },
    { skip: !canAccessLeads },
  );

  // 2. Fetch summary stats
  const { data: statsResponse, isLoading: isStatsLoading } =
    useGetLeadSummaryStatsQuery(undefined, { skip: !canAccessLeads });

  // 3. Fetch services list for dropdowns
  const { data: servicesResponse } = useGetServicesQuery(
    { limit: 100 },
    { skip: !canAccessLeads },
  );
  const servicesList = (servicesResponse?.data || []).map((s) => ({
    id: s.id,
    name: s.name,
  }));

  // 4. Fetch staff members (exclude CLIENT)
  const { data: usersResponse } = useGetUsersQuery({
    limit: 100,
    excludeRoleName: "CLIENT",
  });
  const staffList = (usersResponse?.data || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));

  const [deleteLeadMutation] = useDeleteLeadMutation();

  const leads: BackendLead[] = leadsResponse?.data || [];
  const meta = leadsResponse?.meta;
  const totalCount = meta?.total ?? leads.length;
  const totalPages =
    meta?.totalPage ?? Math.max(1, Math.ceil(totalCount / pageSize));

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setServiceFilter("ALL");
    setAssignedFilter("ALL");
    setStartDate("");
    setEndDate("");
    setSelectedSort("Newest First");
    setCurrentPage(1);
  };

  const handleOpenDrawer = (leadId: string) => {
    setActiveLeadId(leadId);
    setIsDrawerOpen(true);
  };

  const handleDeleteLead = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: "Delete Prospective Lead",
      message: `Are you sure you want to delete lead "${name}"? This action cannot be undone.`,
      confirmText: "Yes, Delete Lead",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!isConfirmed) return;

    try {
      await deleteLeadMutation(id).unwrap();
      await alert({
        title: "Lead Deleted",
        message: `Prospective lead "${name}" has been permanently removed.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Delete Error",
        message: err?.data?.message || "Failed to delete lead",
        variant: "danger",
      });
    }
  };

  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Table Columns
  const columns: ColumnDef<BackendLead>[] = [
    {
      key: "created",
      header: "CREATED DATE",
      cell: (lead: BackendLead) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <div className="text-xs font-bold text-[#0a0a0a]">
            {formatExplicitDate(lead.createdAt)}
          </div>
          {lead.updatedAt && (
            <div className="text-[10px] text-[#64748B] flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
              <span>Upd: {formatExplicitDate(lead.updatedAt)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "fullName",
      header: "LEAD CONTACT",
      cell: (lead: BackendLead) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {lead.clientCode && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white shadow-xs">
                  {lead.clientCode}
                </span>
              )}
              {lead.priority && (
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.2 rounded text-[10px] uppercase font-bold border",
                    priorityBadgeClass(lead.priority),
                  )}>
                  {lead.priority}
                </span>
              )}
              <Link
                href={`/leads/${lead.id}`}
                className="text-sm font-bold text-[#0a0a0a] hover:underline">
                {lead.fullName}
              </Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
              <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>{lead.phone}</span>
              {lead.country && <span>• {lead.country}</span>}
              {lead.leadSource && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                  via {lead.leadSource}
                </span>
              )}
            </div>
            {lead.email && (
              <div className="text-[11px] text-[#64748B]">{lead.email}</div>
            )}
            {((lead.documents && lead.documents.length > 0) || (lead._count?.documents && lead._count.documents > 0)) && (
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <span>📄 {lead.documents?.length || lead._count?.documents} Document(s)</span>
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "STATUS & MEETING",
      cell: (lead: BackendLead) => (
        <div className="space-y-1">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold",
              statusClass[lead.status] || "bg-slate-100 text-slate-700",
            )}>
            {statusLabel[lead.status] || lead.status}
          </span>
          {lead.meetingDateTimeStr && (
            <div className="text-[11px] font-medium text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded flex items-center gap-1">
              <span>📅 {lead.meetingDateTimeStr}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "service",
      header: "SERVICE & ASSESSMENT",
      cell: (lead: BackendLead) => {
        const service = lead.service;
        return (
          <div className="space-y-1">
            {service ? (
              <div>
                <div className="text-sm font-bold text-[#0a0a0a]">{service.name}</div>
                <div className="text-xs text-[#64748B] font-mono">{service.code}</div>
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#64748B] italic">
                General
              </span>
            )}
            {lead.profileAssessment && (
              <div className="pt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                    assessmentBadgeClass(lead.profileAssessment),
                  )}>
                  {lead.profileAssessment}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "assignedTo",
      header: "ASSIGNED STAFF",
      cell: (lead: BackendLead) => {
        const staff = lead.assignedTo;
        if (!staff) {
          return (
            <span className="text-xs font-semibold text-[#64748B] italic">
              Unassigned
            </span>
          );
        }
        return (
          <div>
            <div className="text-sm font-bold text-[#0a0a0a]">{staff.name}</div>
            <div className="text-xs text-[#64748B]">
              {staff.role?.name || "Staff"}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      cell: (lead: BackendLead) => {
        const cleanedPhone = lead.phone.replace(/[^0-9]/g, "");
        const waUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
          `Hello ${lead.fullName}, I'm reaching out from AdSkill Consultancy regarding your inquiry.`,
        )}`;

        return (
          <div
            className="relative flex justify-end items-center"
            onClick={(e) => e.stopPropagation()}>
            {/* Action Dropdown Trigger (3 dots) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === lead.id ? null : lead.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] hover:bg-[#F1ECE4] border border-[#EAE6DF] text-slate-700 transition-colors cursor-pointer"
              title="Actions Menu">
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown Menu Popup */}
            {activeMenuId === lead.id && (
              <div className="absolute right-0 top-9 z-30 w-48 rounded-2xl border border-[#EAE6DF] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                {/* View Details */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenuId(null);
                    router.push(`/leads/${lead.id}`);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer">
                  <Eye className="h-3.5 w-3.5 text-sky-600" />
                  <span>View Details & Dossier</span>
                </button>

                {/* WhatsApp Chat */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setActiveMenuId(null)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>

                {/* Copy Phone */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenuId(null);
                    navigator.clipboard?.writeText(lead.phone);
                    alert({
                      title: "Phone Copied",
                      message: `Copied ${lead.phone} to clipboard.`,
                      variant: "success",
                    });
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer">
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Phone Number</span>
                </button>

                <div className="my-1 border-t border-[#F0ECE6]" />

                {/* Delete Lead */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenuId(null);
                    handleDeleteLead(lead.id, lead.fullName);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Delete Lead</span>
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  if (user && !canAccessLeads) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-[#0a0a0a] tracking-tight">Access Restricted</h2>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-[#64748B]">
          Leads Management is exclusively accessible to authorized Staff Members.
        </p>
        <div className="mt-6">
          <Button asChild className="rounded-xl bg-[#0a0a0a] text-white text-xs font-bold px-5 h-10">
            <Link href={ROUTES.DASHBOARD}>Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header (Identical to ClientListView) */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <UserPlus className="h-5 w-5 text-[#0a0a0a]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span>{parentBreadcrumb}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-bold text-[#0a0a0a]">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* 2. Metric Cards Overview */}
      <LeadMetricCards
        stats={statsResponse?.data}
        isLoading={isStatsLoading}
      />

      {/* 3. Search Bar (Matching ClientSearchBar) */}
      <LeadSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        serviceFilter={serviceFilter}
        onServiceChange={(srv) => {
          setServiceFilter(srv);
          setCurrentPage(1);
        }}
        assignedFilter={assignedFilter}
        onAssignedChange={(stf) => {
          setAssignedFilter(stf);
          setCurrentPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(d) => {
          setStartDate(d);
          setCurrentPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(d) => {
          setEndDate(d);
          setCurrentPage(1);
        }}
        sortOption={selectedSort}
        onSortChange={(sort) => {
          setSelectedSort(sort);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        servicesList={servicesList}
        staffList={staffList}
      />

      {/* 4. Table (Identical to ServiceListView / ClientListView) */}
      {isLoading ? (
        <DataTable<BackendLead>
          title={categoryLabel}
          data={[]}
          columns={columns}
          isLoading={true}
          keyExtractor={(item) => item.id}
          totalCount={0}
          currentPage={1}
          pageSize={pageSize}
          totalPages={1}
        />
      ) : isError ? (
        <div className="rounded-3xl border border-[#FECACA] bg-white p-10 text-center">
          <p className="text-sm text-[#B91C1C]">Could not load leads.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-3xl border border-[#EAE6DF] bg-white p-10 text-center text-sm text-[#64748B] space-y-1.5">
          <p className="font-bold text-[#0a0a0a]">
            No leads match current filters.
          </p>
          <p className="text-xs">
            Try adjusting your search criteria or click 'New Lead' to add a prospective client.
          </p>
        </div>
      ) : (
        <DataTable<BackendLead>
          title={categoryLabel}
          data={leads}
          columns={columns}
          keyExtractor={(item) => item.id}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          itemLabel="leads"
          sortBy={selectedSort}
          sortOptions={[
            "Newest First",
            "Oldest First",
            "Name (A-Z)",
            "Name (Z-A)",
          ]}
          isLoading={isLoading || isFetching}
          onSortChange={(sort) => {
            setSelectedSort(sort);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
          onRowClick={(item) => router.push(`/leads/${item.id}`)}
        />
      )}

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        servicesList={servicesList}
        staffList={staffList}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Activity Timeline & Log Drawer */}
      <LeadActivityDrawer
        leadId={activeLeadId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setActiveLeadId(null);
        }}
        staffList={staffList}
        servicesList={servicesList}
      />
    </div>
  );
}
