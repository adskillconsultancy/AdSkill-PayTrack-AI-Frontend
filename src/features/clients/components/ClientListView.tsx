"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { DataTable, ColumnDef } from "@/components/common/DataTable";
import { ClientItem, ClientStatus } from "../types";
import { MOCK_CLIENTS, INITIAL_CLIENT_STATS } from "../mockData";
import { ClientMetricCards } from "./ClientMetricCards";
import { ClientSearchBar } from "./ClientSearchBar";
import { ClientDetailModal } from "./ClientDetailModal";
import { NewClientModal } from "./NewClientModal";
import {
  FileText,
  ChevronRight,
  Eye,
  MoreVertical,
  Check,
  Clock,
  Send,
  Trash2,
  Copy,
} from "lucide-react";

interface ClientListViewProps {
  pageTitle?: string;
  categoryLabel?: string;
  parentBreadcrumb?: string;
  initialClients?: ClientItem[];
}

export function ClientListView({
  pageTitle = "Application List",
  categoryLabel = "ALL APPLICATIONS",
  parentBreadcrumb = "Visa Applications",
  initialClients = MOCK_CLIENTS,
}: ClientListViewProps) {
  const [clients, setClients] = React.useState<ClientItem[]>(initialClients);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [destinationFilter, setDestinationFilter] = React.useState<string>("ALL");
  const [selectedSort, setSelectedSort] = React.useState("Newest First");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Selected client for detail modal
  const [selectedClient, setSelectedClient] = React.useState<ClientItem | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = React.useState(false);

  // Active action dropdown menu for row
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleOutsideClick() {
      setActiveMenuId(null);
    }
    if (activeMenuId) {
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [activeMenuId]);

  // Handle new client addition
  const handleAddNewClient = (newClient: ClientItem) => {
    setClients((prev) => [newClient, ...prev]);
    setSelectedClient(newClient);
  };

  // Filter logic
  const filteredClients = React.useMemo(() => {
    return clients.filter((client) => {
      // Search matching (name, ID, email, passport, destination, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = client.name.toLowerCase().includes(q);
        const matchesId = client.clientId.toLowerCase().includes(q);
        const matchesCountry = client.destination.country.toLowerCase().includes(q);
        const matchesCode = client.destination.code.toLowerCase().includes(q);
        const matchesVisa = client.visaCategory.title.toLowerCase().includes(q);
        const matchesPassport =
          client.passportNumber?.toLowerCase().includes(q) || false;

        if (
          !matchesName &&
          !matchesId &&
          !matchesCountry &&
          !matchesCode &&
          !matchesVisa &&
          !matchesPassport
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL" && client.status !== statusFilter) {
        return false;
      }

      // Destination filter
      if (
        destinationFilter !== "ALL" &&
        client.destination.country !== destinationFilter
      ) {
        return false;
      }

      return true;
    });
  }, [clients, searchQuery, statusFilter, destinationFilter]);

  // Sort logic
  const sortedClients = React.useMemo(() => {
    const list = [...filteredClients];
    switch (selectedSort) {
      case "Newest First":
        return list; // Preserves chronological/mock order
      case "Oldest First":
        return list.reverse();
      case "Client Name (A-Z)":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "Client Name (Z-A)":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list;
    }
  }, [filteredClients, selectedSort]);

  // Status Badge Component
  const renderStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "Processing":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#0D6E6E] ring-1 ring-[#0D6E6E]/15">
            Processing
          </span>
        );
      case "Missing Docs":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] ring-1 ring-[#E11D48]/15">
            Missing Docs
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/15">
            Approved
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#B45309]/15">
            Under Review
          </span>
        );
      case "Delayed":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] ring-1 ring-[#D97706]/15">
            Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#64748B]">
            {status}
          </span>
        );
    }
  };

  // Define Reusable DataTable Columns
  const columns: ColumnDef<ClientItem>[] = [
    {
      key: "client",
      header: "CLIENT & ID",
      cell: (item) => (
        <div className="flex items-center gap-3.5">
          {item.avatarUrl ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white shadow-xs bg-[#EAE6DF]">
              <Image
                src={item.avatarUrl}
                alt={item.name}
                fill
                sizes="44px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-sm font-bold text-[#092244]">
              {item.initials || item.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-sm font-bold text-[#092244] leading-tight">
              {item.name}
            </div>
            <div className="text-xs font-mono font-medium text-[#64748B] mt-0.5">
              ID: {item.clientId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "destination",
      header: "DESTINATION",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#092244]">
            {item.destination.code}
          </span>
          <span className="text-sm font-semibold text-[#092244]">
            {item.destination.country}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "VISA CATEGORY",
      cell: (item) => (
        <div>
          <div className="text-sm font-bold text-[#092244] leading-tight">
            {item.visaCategory.title}
          </div>
          <div className="text-xs text-[#94A3B8] mt-0.5">
            {item.visaCategory.subCategory}
          </div>
        </div>
      ),
    },
    {
      key: "submission",
      header: "SUBMISSION DATE",
      cell: (item) => (
        <div>
          <div className="text-sm font-bold text-[#092244] leading-tight">
            {item.submission.date}
          </div>
          <div className="text-xs text-[#64748B] mt-0.5">
            by Agent: {item.submission.agentName}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      cell: (item) => renderStatusBadge(item.status),
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      cell: (item) => {
        const isMenuOpen = activeMenuId === item.id;

        return (
          <div className="relative flex items-center justify-end gap-2">
            {/* 1. View Eye Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClient(item);
                setIsDetailModalOpen(true);
              }}
              title="View Client Dossier"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#FAF8F5] text-[#092244] hover:bg-[#EAE6DF] hover:text-[#092244] transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </button>

            {/* 2. More Options Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isMenuOpen ? null : item.id);
                }}
                title="More Options"
                className={cn(
                  "flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#FAF8F5] text-[#64748B] hover:bg-[#EAE6DF] hover:text-[#092244] transition-colors cursor-pointer shadow-2xs",
                  isMenuOpen && "bg-[#092244] text-white hover:bg-[#092244]"
                )}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
              </button>

              {/* Action Dropdown Menu */}
              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl border border-[#EAE6DF] bg-white p-1.5 shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(item);
                      setIsDetailModalOpen(true);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#092244] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>View Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(item.clientId);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#092244] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>Copy Client ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Sent payment reminder to ${item.name}`);
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#092244] rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 text-[#F3A712]" />
                    <span>Send Reminder</span>
                  </button>

                  <div className="my-1 border-t border-[#F0ECE6]" />

                  <button
                    type="button"
                    onClick={() => {
                      setClients((prev) => prev.filter((c) => c.id !== item.id));
                      setActiveMenuId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#E11D48] rounded-xl hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#E11D48]" />
                    <span>Remove Case</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. TOP BREADCRUMB & PAGE TITLE ── */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] shadow-2xs">
          <FileText className="h-5 w-5 text-[#092244]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
            <span>{parentBreadcrumb}</span>
            <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
            <span className="text-[#092244] font-bold">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH BAR & ACTION TOOLBAR ── */}
      <ClientSearchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }}
        destinationFilter={destinationFilter}
        onDestinationFilterChange={(d) => {
          setDestinationFilter(d);
          setCurrentPage(1);
        }}
        onNewClientClick={() => setIsNewClientModalOpen(true)}
      />

      {/* ── 3. 4 METRIC SUMMARY KPI CARDS ── */}
      <ClientMetricCards
        stats={INITIAL_CLIENT_STATS}
        activeFilter={statusFilter}
        onFilterSelect={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
      />

      {/* ── 4. REUSABLE DATA TABLE CONTAINER ── */}
      <DataTable<ClientItem>
        title={categoryLabel}
        data={sortedClients}
        columns={columns}
        keyExtractor={(item) => item.id}
        totalCount={12482}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={124}
        itemLabel="applications"
        sortBy={selectedSort}
        sortOptions={[
          "Newest First",
          "Oldest First",
          "Client Name (A-Z)",
          "Client Name (Z-A)",
        ]}
        onSortChange={(sort) => setSelectedSort(sort)}
        onPageChange={(page) => setCurrentPage(page)}
        onRowClick={(item) => {
          setSelectedClient(item);
          setIsDetailModalOpen(true);
        }}
      />

      {/* ── 5. MODALS ── */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClient(null);
        }}
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSubmit={handleAddNewClient}
      />
    </div>
  );
}
