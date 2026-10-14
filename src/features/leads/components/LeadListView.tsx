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
} from "lucide-react";

interface LeadListViewProps {
  pageTitle?: string;
  categoryLabel?: string;
  parentBreadcrumb?: string;
}

const statusClass: Record<LeadStatus, string> = {
  NEW: "bg-[#EBF8FF] text-[#0284C7]",
  CONTACTED: "bg-[#F3E8FF] text-[#9333EA]",
  IN_PROGRESS: "bg-[#E0E7FF] text-[#4338CA]",
  FOLLOW_UP: "bg-[#FEF3C7] text-[#B45309]",
  QUALIFIED: "bg-[#CCFBF1] text-[#0F766E]",
  CONVERTED: "bg-[#ECFDF5] text-[#059669]",
  LOST: "bg-[#FFF1F2] text-[#E11D48]",
};

const statusLabel: Record<LeadStatus, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In Progress",
  FOLLOW_UP: "Follow-Up",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  LOST: "Lost",
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

  // 1. Fetch live leads
  const {
    data: leadsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetLeadsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter,
    serviceId: serviceFilter,
    assignedToId: assignedFilter,
    sortBy,
    sortOrder,
  });

  // 2. Fetch summary stats
  const { data: statsResponse, isLoading: isStatsLoading } =
    useGetLeadSummaryStatsQuery();

  // 3. Fetch services list for dropdowns
  const { data: servicesResponse } = useGetServicesQuery({ limit: 100 });
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

  // Table Columns (Matching ClientListView exact styling)
  const columns: ColumnDef<BackendLead>[] = [
    {
      key: "fullName",
      header: "LEAD CONTACT",
      cell: (lead: BackendLead) => {
        return (
          <div>
            <Link
              href={`/leads/${lead.id}`}
              className="text-sm font-bold text-[#0a0a0a] hover:underline">
              {lead.fullName}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5 font-medium">
              <Phone className="h-3 w-3 text-emerald-600" />
              <span>{lead.phone}</span>
              {lead.country && <span>• {lead.country}</span>}
            </div>
            {lead.email && (
              <div className="text-[11px] text-[#64748B]">{lead.email}</div>
            )}
          </div>
        );
      },
    },
    {
      key: "service",
      header: "SERVICE INTENDED",
      cell: (lead: BackendLead) => {
        const service = lead.service;
        if (!service) {
          return (
            <span className="text-sm font-semibold text-[#64748B] italic">
              Not specified
            </span>
          );
        }
        return (
          <div>
            <div className="text-sm font-bold text-[#0a0a0a]">{service.name}</div>
            <div className="text-xs text-[#64748B] font-mono">{service.code}</div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "STATUS",
      cell: (lead: BackendLead) => (
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-bold",
            statusClass[lead.status] || "bg-slate-100 text-slate-700",
          )}>
          {statusLabel[lead.status] || lead.status}
        </span>
      ),
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
      key: "created",
      header: "CREATED & UPDATED",
      cell: (lead: BackendLead) => (
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-[#0a0a0a]">
            {formatExplicitDate(lead.createdAt)}
          </div>
          {lead.updatedAt && (
            <div className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
              <span>Updated {formatExplicitDate(lead.updatedAt)}</span>
            </div>
          )}
        </div>
      ),
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
          <div className="flex justify-end items-center gap-1.5">
            {/* WhatsApp Quick Action Button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full bg-[#FAF8F5] p-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 cursor-pointer transition-colors"
              title="Chat on WhatsApp">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
            </a>

            {/* Copy Phone */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard?.writeText(lead.phone);
              }}
              className="rounded-full bg-[#FAF8F5] p-2 hover:bg-[#F1ECE4] cursor-pointer transition-colors text-slate-700"
              title="Copy Phone Number">
              <Copy className="h-4 w-4" />
            </button>

            {/* View Details / Timeline on dedicated page */}
            <Link
              href={`/leads/${lead.id}`}
              className="rounded-full bg-[#FAF8F5] p-2 hover:bg-[#F1ECE4] cursor-pointer transition-colors text-slate-700"
              title="View Lead Details & Timeline">
              <Eye className="h-4 w-4" />
            </Link>

            {/* Delete Lead */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteLead(lead.id, lead.fullName);
              }}
              className="rounded-full bg-[#FAF8F5] p-2 hover:bg-rose-50 text-slate-700 hover:text-rose-600 cursor-pointer transition-colors"
              title="Delete Lead">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

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
