"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { ServiceItem, ServiceStatus } from "../types";
import {
  MOCK_SERVICES,
  INITIAL_SERVICE_STATS,
  getMockServices,
  saveMockServices,
  addMockService,
} from "../mockData";
import { ServiceMetricCards } from "./ServiceMetricCards";
import { ServiceSearchBar } from "./ServiceSearchBar";
import { NewServiceModal } from "./NewServiceModal";
import { ROUTES } from "@/constants/routes";
import {
  Briefcase,
  ChevronRight,
  Eye,
  MoreVertical,
  Plus,
  Shield,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  RotateCw,
  FileSpreadsheet,
  Trash2,
  UserPlus,
} from "lucide-react";

interface ServiceListViewProps {
  pageTitle?: string;
  categoryLabel?: string;
  initialServices?: ServiceItem[];
}

export function ServiceListView({
  pageTitle = "Service Catalog & Fee Separation",
  categoryLabel = "OFFICIAL SERVICE DIRECTORY",
  initialServices = MOCK_SERVICES,
}: ServiceListViewProps) {
  const router = useRouter();
  const [services, setServices] = React.useState<ServiceItem[]>(initialServices);

  React.useEffect(() => {
    setServices(getMockServices());
  }, []);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [destinationFilter, setDestinationFilter] = React.useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sortOption, setSortOption] = React.useState("Most Enrolled");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Quick Add modal
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = React.useState(false);

  // Active dropdown menu for row
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleOutsideClick() {
      setActiveMenuId(null);
    }
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter & search logic
  const filteredServices = React.useMemo(() => {
    return services
      .filter((s) => {
        // Search
        const matchesSearch =
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.destination.country.toLowerCase().includes(searchQuery.toLowerCase());

        // Destination
        const matchesDest =
          destinationFilter === "ALL" || s.destination.country === destinationFilter;

        // Category
        const matchesCategory =
          categoryFilter === "ALL" || s.category === categoryFilter;

        // Status
        const matchesStatus =
          statusFilter === "ALL" || s.status === statusFilter;

        return matchesSearch && matchesDest && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOption === "Most Enrolled") {
          return b.activeCasesCount - a.activeCasesCount;
        }
        if (sortOption === "Highest Fee") {
          return b.professionalFee - a.professionalFee;
        }
        if (sortOption === "Lowest Fee") {
          return a.professionalFee - b.professionalFee;
        }
        if (sortOption === "Alphabetical") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [
    services,
    searchQuery,
    destinationFilter,
    categoryFilter,
    statusFilter,
    sortOption,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setDestinationFilter("ALL");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setSortOption("Most Enrolled");
    setCurrentPage(1);
  };

  const handleQuickAddService = (newSvc: ServiceItem) => {
    addMockService(newSvc);
    setServices(getMockServices());
  };

  const handleDeleteService = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    saveMockServices(updated);
    setActiveMenuId(null);
  };

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = services.map((s) => {
      if (s.id === id) {
        const nextStatus: ServiceStatus =
          s.status === "Active" ? "Draft" : "Active";
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setServices(updated);
    saveMockServices(updated);
    setActiveMenuId(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "Code",
      "Title",
      "Category",
      "Country",
      "AdSkill Advisory Fee",
      "Pass-Through Cost",
      "Total Client Cost",
      "Currency",
      "Active Cases",
      "Status",
    ];
    const rows = filteredServices.map((s) => {
      const ptSum = s.passThroughFees.reduce((acc, f) => acc + f.amount, 0);
      return [
        `"${s.code}"`,
        `"${s.title}"`,
        `"${s.category}"`,
        `"${s.destination.country}"`,
        s.professionalFee,
        ptSum,
        s.totalClientCost,
        s.currency,
        s.activeCasesCount,
        s.status,
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

  // Metric stats computed dynamically
  const computedStats = React.useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === "Active").length;
    const avg =
      total > 0
        ? Math.round(
            services.reduce((acc, s) => acc + s.professionalFee, 0) / total
          )
        : 0;
    const passThroughCount = services.reduce(
      (acc, s) => acc + s.passThroughFees.length,
      0
    );
    return {
      totalServices: total,
      activePrograms: active,
      avgProfessionalFee: avg,
      totalPassThroughTracked: passThroughCount,
    };
  }, [services]);

  // Column definitions for DataTable
  const columns: ColumnDef<ServiceItem>[] = [
    {
      key: "code",
      header: "Service / Code",
      accessorKey: "code",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] font-black text-sm shadow-2xs">
            {item.destination.flag}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#092244] text-xs">
                {item.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-0.5">
              <span className="font-mono font-bold text-[#092244]">
                {item.code}
              </span>
              <span>&bull;</span>
              <span>{item.subCategory}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category & Country",
      accessorKey: "category",
      cell: (item) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#092244] block">
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] font-medium">
            <span>{item.destination.flag}</span>
            <span>{item.destination.country}</span>
          </span>
        </div>
      ),
    },
    {
      key: "professionalFee",
      header: "Fee Separation Architecture",
      accessorKey: "professionalFee",
      cell: (item) => {
        const ptSum = item.passThroughFees.reduce((acc, f) => acc + f.amount, 0);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                ${item.professionalFee.toLocaleString()} Advisory
              </span>
              {ptSum > 0 && (
                <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                  +${ptSum.toLocaleString()} Pass-thru
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#64748B]">
              Total:{" "}
              <strong className="text-[#092244] font-mono">
                ${item.totalClientCost.toLocaleString()} {item.currency}
              </strong>
            </div>
          </div>
        );
      },
    },
    {
      key: "schedulePreset",
      header: "Default Milestones",
      accessorKey: "schedulePreset",
      cell: (item) => (
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#092244] capitalize block">
            {item.schedulePreset.replace(/_/g, " ")}
          </span>
          <span className="text-[10px] text-[#64748B] block">
            {item.defaultMilestones.length} Structured Phases
          </span>
        </div>
      ),
    },
    {
      key: "activeCasesCount",
      header: "Active Cases",
      accessorKey: "activeCasesCount",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#0284C7]" />
          <span className="text-xs font-mono font-black text-[#092244]">
            {item.activeCasesCount}
          </span>
          <span className="text-[10px] text-[#64748B]">enrolled</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessorKey: "status",
      cell: (item) => {
        const isActive = item.status === "Active";
        const isDraft = item.status === "Draft";

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase",
              isActive && "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
              isDraft && "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
              item.status === "Archived" &&
                "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isActive && "bg-[#059669]",
                isDraft && "bg-[#D97706]",
                item.status === "Archived" && "bg-[#64748B]"
              )}
            />
            {item.status}
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
              router.push(`/services/${item.id}`);
            }}
            title="View Service Dossier"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#64748B] hover:text-[#092244] hover:bg-white border border-[#EAE6DF] transition-colors cursor-pointer shadow-2xs"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Quick Onboard Client Button */}
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="h-8 px-2.5 text-[11px] font-bold text-[#092244] hover:bg-[#FAF8F5] gap-1 cursor-pointer hidden md:inline-flex"
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
                  router.push(`/services/${item.id}`);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                <span>View Full Service Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(ROUTES.CLIENT_CREATE);
                  setActiveMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#059669]" />
                <span>Create Client Case</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleToggleStatus(item.id, e)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5 text-[#D97706]" />
                <span>
                  Toggle to {item.status === "Active" ? "Draft" : "Active"}
                </span>
              </button>

              <div className="my-1 border-t border-[#F0ECE6]" />

              <button
                type="button"
                onClick={(e) => handleDeleteService(item.id, e)}
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
              className="hover:text-[#092244] transition-colors"
            >
              Management
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="text-[#092244]">Service Catalog</span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#092244]">
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
            className="h-10 px-3.5 rounded-xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setServices(getMockServices())}
            className="h-10 px-3.5 rounded-xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsNewServiceModalOpen(true)}
            className="h-10 px-3.5 rounded-xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] text-xs font-bold shadow-2xs gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#092244]" />
            <span>Quick Add</span>
          </Button>

          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
          >
            <Link href={ROUTES.SERVICE_CREATE}>
              <Plus className="h-3.5 w-3.5 text-[#F3A712]" />
              <span>Configure New Service</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <ServiceMetricCards
        stats={computedStats}
        activeFilter={statusFilter}
        onFilterSelect={(st) => {
          if (st === "ALL") setStatusFilter("ALL");
          else if (st === "Active") setStatusFilter("Active");
          else setStatusFilter("ALL");
        }}
      />

      {/* Search & Filter Controls */}
      <ServiceSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        destinationFilter={destinationFilter}
        onDestinationChange={setDestinationFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onResetFilters={handleResetFilters}
      />

      {/* ── 4. REUSABLE DATA TABLE CONTAINER ── */}
      <DataTable<ServiceItem>
        title="ACTIVE CATALOG DIRECTORY"
        data={filteredServices}
        columns={columns}
        keyExtractor={(item) => item.id}
        totalCount={filteredServices.length}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={Math.max(1, Math.ceil(filteredServices.length / pageSize))}
        itemLabel="services"
        sortBy={sortOption}
        sortOptions={[
          "All Offerings",
          "Advisory Fee: High to Low",
          "Advisory Fee: Low to High",
          "Most Active Cases",
          "Title (A-Z)",
        ]}
        onSortChange={(sort) => {
          setSortOption(sort);
          setCurrentPage(1);
        }}
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(item) => {
          router.push(`/services/${item.id}`);
        }}
        emptyTitle="No services matched your query"
        emptyDescription="Try adjusting your search criteria, country filter, or reset your filters."
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

      {/* Quick Add New Service Modal */}
      <NewServiceModal
        isOpen={isNewServiceModalOpen}
        onClose={() => setIsNewServiceModalOpen(false)}
        onSubmit={handleQuickAddService}
      />
    </div>
  );
}
