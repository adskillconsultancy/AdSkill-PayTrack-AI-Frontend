"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import {
  useGetServicesQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from "@/services/api/services/servicesApi";
import type { BackendService, BackendServiceCategory, ServiceSummaryStats } from "../types";
import { ServiceMetricCards } from "./ServiceMetricCards";
import { ServiceSearchBar } from "./ServiceSearchBar";
import { ROUTES } from "@/constants/routes";
import {
  Briefcase,
  ChevronRight,
  Eye,
  MoreVertical,
  Shield,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  RotateCw,
  FileSpreadsheet,
  Pencil,
  Trash2,
  UserPlus,
  Scale,
} from "lucide-react";

interface ServiceListViewProps {
  pageTitle?: string;
  categoryLabel?: string;
}

export function ServiceListView({
  pageTitle = "Service Catalog & Fee Separation",
  categoryLabel = "OFFICIAL SERVICE DIRECTORY",
}: ServiceListViewProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<BackendServiceCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortOption, setSortOption] = React.useState("Newest First");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Active dropdown menu for row
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleOutsideClick() {
      setActiveMenuId(null);
    }
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Translate sort option to backend parameters
  const { sortBy, sortOrder } = React.useMemo(() => {
    switch (sortOption) {
      case "Oldest First":
        return { sortBy: "createdAt", sortOrder: "asc" as const };
      case "Name (A-Z)":
        return { sortBy: "name", sortOrder: "asc" as const };
      case "Name (Z-A)":
        return { sortBy: "name", sortOrder: "desc" as const };
      case "Fee: High to Low":
        return { sortBy: "baseFee", sortOrder: "desc" as const };
      case "Fee: Low to High":
        return { sortBy: "baseFee", sortOrder: "asc" as const };
      case "Newest First":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" as const };
    }
  }, [sortOption]);

  // 🌟 Live Backend API Query (100% Real Data from PostgreSQL) 🌟
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetServicesQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
    isActive:
      statusFilter === "ALL"
        ? undefined
        : statusFilter === "ACTIVE"
        ? "true"
        : "false",
    sortBy,
    sortOrder,
  });

  const [deleteServiceMutation, { isLoading: isDeleting }] = useDeleteServiceMutation();
  const [updateServiceMutation] = useUpdateServiceMutation();

  const services: BackendService[] = response?.data || [];
  const meta = response?.meta;
  const totalCount = meta?.total ?? services.length;
  const totalPages = meta?.totalPage ?? Math.max(1, Math.ceil(totalCount / pageSize));

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setSortOption("Newest First");
    setCurrentPage(1);
  };

  // Delete Service Action
  const handleDeleteService = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const s = services.find((item) => item.id === id);
    const serviceName = s ? `"${s.name}" (${s.code})` : "this service";
    if (!window.confirm(`Are you sure you want to deactivate and remove ${serviceName}?`)) return;

    try {
      await deleteServiceMutation(id).unwrap();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message || "Failed to delete service"
          : "Failed to delete service";
      alert(msg);
    }
    setActiveMenuId(null);
  };

  // Toggle Active/Inactive Status Action
  const handleToggleStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = services.find((s) => s.id === id);
    if (!current) return;
    const nextIsActive = !current.isActive;

    try {
      await updateServiceMutation({ id, data: { isActive: nextIsActive } }).unwrap();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message || "Failed to update service status"
          : "Failed to update service status";
      alert(msg);
    }
    setActiveMenuId(null);
  };

  // Export CSV of Real Data
  const handleExportCSV = () => {
    const headers = [
      "Code",
      "Title",
      "Category",
      "AdSkill Advisory Fee",
      "Gov Fee",
      "Attorney Fee",
      "Third Party Fee",
      "Total Pass-Through",
      "Total Client Cost",
      "Currency",
      "Duration",
      "Status",
    ];
    const rows = services.map((s) => {
      const base = Number(s.baseFee || 0);
      const gov = Number(s.estimatedGovFee || 0);
      const atty = Number(s.estimatedAttorneyFee || 0);
      const third = Number(s.estimatedThirdPartyFee || 0);
      const passThrough = gov + atty + third;
      const total = base + passThrough;

      return [
        `"${s.code}"`,
        `"${s.name}"`,
        `"${s.category}"`,
        base,
        gov,
        atty,
        third,
        passThrough,
        total,
        s.currency || "USD",
        `"${s.estimatedDuration || "N/A"}"`,
        s.isActive ? "Active" : "Inactive",
      ].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adskill_services_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Metrics Computed from Real Data
  const computedStats: ServiceSummaryStats = React.useMemo(() => {
    const total = totalCount;
    const active = services.filter((s) => s.isActive).length;
    const sumBase = services.reduce((acc, s) => acc + Number(s.baseFee || 0), 0);
    const avgBase = services.length > 0 ? Math.round(sumBase / services.length) : 0;
    const passThroughCount = services.reduce(
      (acc, s) =>
        acc +
        (Number(s.estimatedGovFee || 0) > 0 ? 1 : 0) +
        (Number(s.estimatedAttorneyFee || 0) > 0 ? 1 : 0) +
        (Number(s.estimatedThirdPartyFee || 0) > 0 ? 1 : 0),
      0
    );

    return {
      totalServices: total,
      activePrograms: active,
      avgProfessionalFee: avgBase,
      totalPassThroughTracked: passThroughCount,
    };
  }, [services, totalCount]);

  // Category Badge Render Helper
  const renderCategoryBadge = (category: BackendServiceCategory) => {
    switch (category) {
      case "IMMIGRATION":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
            Immigration
          </span>
        );
      case "BUSINESS":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Business
          </span>
        );
      case "CONSULTATION":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Consultation
          </span>
        );
      case "DMV_PSB":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
            DMV / PSB
          </span>
        );
      case "CUSTOM":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide uppercase bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            Custom
          </span>
        );
    }
  };

  // DataTable Column Definitions
  const columns: ColumnDef<BackendService>[] = [
    {
      key: "code",
      header: "Service / Code",
      accessorKey: "code",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] font-black text-xs text-[#0a0a0a] shadow-2xs">
            <Briefcase className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#0a0a0a] text-xs">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-0.5">
              <span className="font-mono font-bold text-[#0a0a0a]">
                {item.code}
              </span>
              <span>&bull;</span>
              <span>{item.category.replace("_", " ")}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      accessorKey: "category",
      cell: (item) => (
        <div className="space-y-1">
          {renderCategoryBadge(item.category)}
        </div>
      ),
    },
    {
      key: "professionalFee",
      header: "Fee Separation Architecture",
      accessorKey: "baseFee",
      cell: (item) => {
        const base = Number(item.baseFee || 0);
        const ptSum =
          Number(item.estimatedGovFee || 0) +
          Number(item.estimatedAttorneyFee || 0) +
          Number(item.estimatedThirdPartyFee || 0);
        const totalCost = base + ptSum;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                ${base.toLocaleString()} Advisory
              </span>
              {ptSum > 0 && (
                <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                  +${ptSum.toLocaleString()} Pass-thru
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#64748B]">
              Total:{" "}
              <strong className="text-[#0a0a0a] font-mono">
                ${totalCost.toLocaleString()} {item.currency || "USD"}
              </strong>
            </div>
          </div>
        );
      },
    },
    {
      key: "milestones",
      header: "Retainer & Terms",
      cell: (item) => {
        const deposit = item.defaultDeposit ? Number(item.defaultDeposit) : null;
        const installments = item.defaultInstallments;

        return (
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#0a0a0a] block">
              {deposit !== null ? `$${deposit.toLocaleString()} Retainer` : "No Deposit"}
            </span>
            <span className="text-[10px] text-[#64748B] block">
              {installments ? `${installments} Milestone Installments` : "Custom Schedule"}
            </span>
          </div>
        );
      },
    },
    {
      key: "duration",
      header: "Timeline",
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <Clock className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span>{item.estimatedDuration || "6-9 Months"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessorKey: "isActive",
      cell: (item) => {
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase",
              item.isActive
                ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                : "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                item.isActive ? "bg-[#059669]" : "bg-[#94A3B8]"
              )}
            />
            {item.isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div
          className="relative flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Inspect Dossier Button */}
          <button
            type="button"
            onClick={() => {
              router.push(`/services/${item.code || item.id}`);
            }}
            title="View Service Dossier"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#64748B] hover:text-[#0a0a0a] hover:bg-white border border-[#EAE6DF] transition-colors cursor-pointer shadow-2xs"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Quick Onboard Client Button */}
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="h-8 px-2.5 text-[11px] font-bold text-[#0a0a0a] hover:bg-[#FAF8F5] gap-1 cursor-pointer hidden md:inline-flex"
          >
            <Link href={ROUTES.CLIENT_CREATE}>
              <UserPlus className="h-3 w-3 text-[#F3A712]" />
              <span>Enroll</span>
            </Link>
          </Button>

          {/* Row Dropdown Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === item.id ? null : item.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-[#FAF8F5] text-[#64748B] transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu Popup */}
          {activeMenuId === item.id && (
            <div className="absolute right-0 top-9 z-30 w-52 rounded-2xl border border-[#EAE6DF] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  router.push(`/services/${item.code || item.id}`);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                <span>View Full Service Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(`/services/${item.code || item.id}/edit`);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-[#F3A712]" />
                <span>Edit Service Offering</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(ROUTES.CLIENT_CREATE);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#059669]" />
                <span>Create Client Case</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleToggleStatus(item.id, e)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5 text-[#D97706]" />
                <span>
                  Toggle to {item.isActive ? "Inactive" : "Active"}
                </span>
              </button>

              <div className="my-1 border-t border-[#F0ECE6]" />

              <button
                type="button"
                onClick={(e) => handleDeleteService(item.id, e)}
                disabled={isDeleting}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                <span>Delete Service</span>
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Page Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
            <Link
              href={ROUTES.DASHBOARD}
              className="hover:text-[#0a0a0a] transition-colors"
            >
              Management
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="text-[#0a0a0a]">Service Catalog</span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0a0a0a]">
              {pageTitle}
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <ServiceMetricCards stats={computedStats} />

      {/* Search & Filter Controls */}
      <ServiceSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onResetFilters={handleResetFilters}
      />

      {/* Reusable Data Table Container */}
      <DataTable<BackendService>
        title="ACTIVE CATALOG DIRECTORY"
        data={services}
        columns={columns}
        keyExtractor={(item) => item.id}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        itemLabel="service offerings"
        sortBy={sortOption}
        sortOptions={[
          "Newest First",
          "Oldest First",
          "Name (A-Z)",
          "Name (Z-A)",
          "Fee: High to Low",
          "Fee: Low to High",
        ]}
        isLoading={isLoading || isFetching}
        onSortChange={(sort) => {
          setSortOption(sort);
          setCurrentPage(1);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(item) => {
          router.push(`/services/${item.code || item.id}`);
        }}
        emptyTitle="No services matched your query"
        emptyDescription="No service offerings found matching your criteria. Try adjusting your search query or reset your filters."
        headerAction={
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] hidden sm:inline">
              Need a new case?
            </span>
            <Link
              href={ROUTES.CLIENT_CREATE}
              className="text-xs font-bold text-[#059669] hover:underline"
            >
              Open Client Onboarding &rarr;
            </Link>
          </div>
        }
      />
    </div>
  );
}
