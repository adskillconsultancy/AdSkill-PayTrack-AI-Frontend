"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { useGetAllCasesQuery } from "@/services/api/clients/clientCasesApi";
import { usePermissions } from "@/hooks/usePermissions";
import type { ClientCase, CaseStatus } from "@/types/client-case.types";
import { FileText, ChevronRight, Eye, Copy, RefreshCw, ShieldCheck } from "lucide-react";
import { ClientMetricCards } from "./ClientMetricCards";
import { ClientSearchBar } from "./ClientSearchBar";

interface ClientListViewProps {
  pageTitle?: string;
  categoryLabel?: string;
  parentBreadcrumb?: string;
}

const statusLabel: Record<CaseStatus, string> = {
  INTAKE: "Intake",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusClass: Record<CaseStatus, string> = {
  INTAKE: "bg-[#FEF3C7] text-[#B45309]",
  ACTIVE: "bg-[#E6F4F1] text-[#0D6E6E]",
  ON_HOLD: "bg-[#FFF1F2] text-[#E11D48]",
  COMPLETED: "bg-[#ECFDF5] text-[#059669]",
  CANCELLED: "bg-[#F1F5F9] text-[#64748B]",
};

const formatDate = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));

export function ClientListView({
  pageTitle = "Application List",
  categoryLabel = "ALL APPLICATIONS",
  parentBreadcrumb = "Visa Applications",
}: ClientListViewProps) {
  const router = useRouter();
  const { role, user, isSuperAdmin, hasPermission } = usePermissions();
  const isConsultant = role === "CONSULTANT";
  const canCreateClient = isSuperAdmin || hasPermission("user:create") || hasPermission("case:create");

  const { data, isLoading, isError, refetch } = useGetAllCasesQuery();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [destinationFilter, setDestinationFilter] = React.useState("ALL");
  const [selectedSort, setSelectedSort] = React.useState("Newest First");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const rawCases = data?.data ?? [];
  // Defense-in-depth: If role is CONSULTANT, ensure cases are strictly scoped to this consultant
  const cases = React.useMemo(() => {
    if (isConsultant && user?.id) {
      return rawCases.filter(
        (item) => item.assignedConsultantId === user.id || item.assignedConsultant?.id === user.id
      );
    }
    return rawCases;
  }, [rawCases, isConsultant, user?.id]);

  const effectivePageTitle = isConsultant ? "My Assigned Applications" : pageTitle;
  const effectiveCategoryLabel = isConsultant ? "MY ASSIGNED CLIENT APPLICATIONS" : categoryLabel;

  const destinations = React.useMemo(() => [...new Set(cases.map((item) => item.destinationCountry).filter(Boolean) as string[])], [cases]);
  const filteredCases = React.useMemo(() => cases.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || [item.caseCode, item.serviceNameSnapshot, item.serviceCodeSnapshot, item.destinationCountry, item.user?.name, item.user?.email].some((value) => value?.toLowerCase().includes(query));
    return matchesQuery && (statusFilter === "ALL" || item.caseStatus === statusFilter) && (destinationFilter === "ALL" || item.destinationCountry === destinationFilter);
  }).sort((a, b) => {
    if (selectedSort === "Oldest First") return +new Date(a.createdAt) - +new Date(b.createdAt);
    if (selectedSort === "Client Name (A-Z)") return (a.user?.name ?? "").localeCompare(b.user?.name ?? "");
    if (selectedSort === "Client Name (Z-A)") return (b.user?.name ?? "").localeCompare(a.user?.name ?? "");
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  }), [cases, searchQuery, statusFilter, destinationFilter, selectedSort]);

  const stats = React.useMemo(() => ({
    inProgress: cases.filter((item) => item.caseStatus === "ACTIVE" || item.caseStatus === "INTAKE").length,
    approved: cases.filter((item) => item.caseStatus === "COMPLETED").length,
    actionRequired: cases.filter((item) => item.caseStatus === "ON_HOLD").length,
    delayed: cases.filter((item) => item.financialStatus === "OVERDUE").length,
  }), [cases]);

  const columns: ColumnDef<ClientCase>[] = [
    { key: "client", header: "CLIENT & CASE", cell: (item) => <div><div className="text-sm font-bold text-[#0a0a0a]">{item.user?.name ?? "Client"}</div><div className="text-xs font-mono text-[#64748B]">{item.caseCode}</div></div> },
    { key: "destination", header: "DESTINATION", cell: (item) => <span className="text-sm font-semibold">{item.destinationCountry || "Not set"}</span> },
    { key: "service", header: "SERVICE", cell: (item) => <div><div className="text-sm font-bold">{item.serviceNameSnapshot}</div><div className="text-xs text-[#64748B]">{item.serviceCodeSnapshot}</div></div> },
    { key: "created", header: "CREATED", cell: (item) => <span className="text-sm font-semibold">{formatDate(item.createdAt)}</span> },
    { key: "status", header: "STATUS", cell: (item) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass[item.caseStatus]}`}>{statusLabel[item.caseStatus]}</span> },
    { key: "actions", header: "ACTIONS", align: "right", cell: (item) => <div className="flex justify-end gap-2"><button type="button" onClick={() => navigator.clipboard?.writeText(item.caseCode)} className="rounded-full bg-[#FAF8F5] p-2 hover:bg-[#F1ECE4] cursor-pointer transition-colors" title="Copy case code"><Copy className="h-4 w-4" /></button><Link href={`/clients/${item.id}`} className="rounded-full bg-[#FAF8F5] p-2 hover:bg-[#F1ECE4] cursor-pointer transition-colors" title="View case details"><Eye className="h-4 w-4" /></Link></div> },
  ];

  return <div className="space-y-6">
    <div className="flex items-center gap-3.5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
        {isConsultant ? <ShieldCheck className="h-5 w-5 text-blue-600" /> : <FileText className="h-5 w-5" />}
      </div>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black">{effectivePageTitle}</h1>
          {isConsultant && (
            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
              Assigned Caseworker
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span>{parentBreadcrumb}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-bold text-[#0a0a0a]">{effectivePageTitle}</span>
          {isConsultant && (
            <>
              <span>•</span>
              <span className="text-blue-700 font-semibold">
                Only showing client applications assigned to you ({cases.length})
              </span>
            </>
          )}
        </div>
      </div>
    </div>

    <ClientMetricCards stats={stats} isLoading={isLoading} />

    <ClientSearchBar
      searchQuery={searchQuery}
      onSearchChange={(value) => { setSearchQuery(value); setCurrentPage(1); }}
      statusFilter={statusFilter}
      onStatusFilterChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
      destinationFilter={destinationFilter}
      onDestinationFilterChange={(value) => { setDestinationFilter(value); setCurrentPage(1); }}
      availableDestinations={destinations}
      onNewClientClick={() => router.push("/clients/create")}
      showNewClientButton={canCreateClient}
    />

    {isLoading ? (
      <DataTable<ClientCase>
        title={effectiveCategoryLabel}
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
        <p className="text-sm text-[#B91C1C]">Could not load cases.</p>
        <Button type="button" variant="outline" className="mt-4 gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />Retry
        </Button>
      </div>
    ) : filteredCases.length === 0 ? (
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-10 text-center text-sm text-[#64748B] space-y-1.5">
        <p className="font-bold text-[#0a0a0a]">
          {isConsultant && cases.length === 0
            ? "No clients or applications are assigned to you yet."
            : "No cases match current filters."}
        </p>
        <p className="text-xs">
          {isConsultant && cases.length === 0
            ? "When a manager or administrator assigns client applications to your account, they will automatically appear here."
            : "Try adjusting your search criteria or filter parameters."}
        </p>
      </div>
    ) : (
      <DataTable<ClientCase>
        title={effectiveCategoryLabel}
        data={filteredCases}
        columns={columns}
        keyExtractor={(item) => item.id}
        totalCount={filteredCases.length}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={Math.max(1, Math.ceil(filteredCases.length / pageSize))}
        itemLabel="cases"
        sortBy={selectedSort}
        sortOptions={["Newest First", "Oldest First", "Client Name (A-Z)", "Client Name (Z-A)"]}
        onSortChange={setSelectedSort}
        onPageChange={setCurrentPage}
        onRowClick={(item) => router.push(`/clients/${item.id}`)}
      />
    )}
  </div>;
}
