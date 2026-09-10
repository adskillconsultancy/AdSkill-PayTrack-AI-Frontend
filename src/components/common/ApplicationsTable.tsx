"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import {
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type ApplicationStatus =
  | "Processing"
  | "Missing Docs"
  | "Approved"
  | "Under Review"
  | "Rejected";

export interface ApplicationItem {
  id: string;
  appId: string;
  client: {
    name: string;
    avatarUrl?: string;
    initials?: string;
  };
  destination: {
    code: string;
    country: string;
  };
  visaCategory: {
    title: string;
    subCategory: string;
  };
  submission: {
    date: string;
    agentName: string;
  };
  status: ApplicationStatus;
}

// ── Default Mock Data (Matching Design Spec Exactly) ──
export const DEFAULT_APPLICATIONS: ApplicationItem[] = [
  {
    id: "1",
    appId: "#APP-2026-9482",
    client: {
      name: "Arjun Sharma",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      initials: "AS",
    },
    destination: {
      code: "CA",
      country: "Canada",
    },
    visaCategory: {
      title: "Express Entry",
      subCategory: "Federal Skilled Worker",
    },
    submission: {
      date: "Jan 12, 2026",
      agentName: "Sarah K.",
    },
    status: "Processing",
  },
  {
    id: "2",
    appId: "#APP-2026-8571",
    client: {
      name: "Maria Gonzales",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      initials: "MG",
    },
    destination: {
      code: "GB",
      country: "United Kingdom",
    },
    visaCategory: {
      title: "Student Visa",
      subCategory: "Higher Education",
    },
    submission: {
      date: "Jan 10, 2026",
      agentName: "Michael B.",
    },
    status: "Missing Docs",
  },
  {
    id: "3",
    appId: "#APP-2026-7731",
    client: {
      name: "Johnathan Doe",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      initials: "JD",
    },
    destination: {
      code: "AU",
      country: "Australia",
    },
    visaCategory: {
      title: "Work Visa",
      subCategory: "Skilled Nominated",
    },
    submission: {
      date: "Jan 08, 2026",
      agentName: "Seif",
    },
    status: "Approved",
  },
];

export interface ApplicationsTableProps {
  title?: string;
  data?: ApplicationItem[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  sortBy?: string;
  className?: string;
  onSortChange?: (sort: string) => void;
  onPageChange?: (page: number) => void;
  onView?: (item: ApplicationItem) => void;
  onMore?: (item: ApplicationItem) => void;
}

export function ApplicationsTable({
  title = "ALL APPLICATIONS",
  data = DEFAULT_APPLICATIONS,
  totalCount = 12482,
  currentPage = 1,
  totalPages = 124,
  sortBy = "Newest First",
  className,
  onSortChange,
  onPageChange,
  onView,
  onMore,
}: ApplicationsTableProps) {
  const [selectedSort, setSelectedSort] = React.useState(sortBy);
  const [activePage, setActivePage] = React.useState(currentPage);

  const handlePageClick = (page: number) => {
    setActivePage(page);
    onPageChange?.(page);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "Processing":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#0D6E6E]">
            Processing
          </span>
        );
      case "Missing Docs":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48]">
            Missing Docs
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
            Approved
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309]">
            Under Review
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B]">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B]">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden",
        className
      )}
    >
      {/* ── CARD TITLE & SORT BAR ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0ECE6]">
        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#092244]">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <span>Sort by:</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSortChange?.(selectedSort)}
            className="h-auto p-0 font-bold text-[#092244] hover:text-[#F3A712] hover:bg-transparent gap-1"
          >
            <span>{selectedSort}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
          </Button>
        </div>
      </div>

      {/* ── RESPONSIVE TABLE WRAPPER ── */}
      <div className="overflow-x-auto">
        <Table className="w-full border-none shadow-none rounded-none">
          <TableHeader className="bg-[#FAF8F5] border-b border-[#EAE6DF]">
            <TableRow className="border-b border-[#EAE6DF] hover:bg-transparent">
              <TableHead className="h-11 px-6 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#092244]">
                CLIENT &amp; ID
              </TableHead>
              <TableHead className="h-11 px-6 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#092244]">
                DESTINATION
              </TableHead>
              <TableHead className="h-11 px-6 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#092244]">
                VISA CATEGORY
              </TableHead>
              <TableHead className="h-11 px-6 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#092244]">
                SUBMISSION DATE
              </TableHead>
              <TableHead className="h-11 px-6 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#092244]">
                STATUS
              </TableHead>
              <TableHead className="h-11 px-6 text-right text-[11px] font-extrabold uppercase tracking-wider text-[#092244]">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-[#F0ECE6]">
            {data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-[#FAF8F5]/70 transition-colors border-b border-[#F0ECE6]"
              >
                {/* 1. Client & ID */}
                <TableCell className="px-6 py-4.5">
                  <div className="flex items-center gap-3.5">
                    {item.client.avatarUrl ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white shadow-xs bg-[#EAE6DF]">
                        <Image
                          src={item.client.avatarUrl}
                          alt={item.client.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-sm font-bold text-[#092244]">
                        {item.client.initials || item.client.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-[#092244] leading-tight">
                        {item.client.name}
                      </div>
                      <div className="text-xs font-mono font-medium text-[#64748B] mt-0.5">
                        ID: {item.appId}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* 2. Destination */}
                <TableCell className="px-6 py-4.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#092244]">
                      {item.destination.code}
                    </span>
                    <span className="text-sm font-semibold text-[#092244]">
                      {item.destination.country}
                    </span>
                  </div>
                </TableCell>

                {/* 3. Visa Category */}
                <TableCell className="px-6 py-4.5">
                  <div>
                    <div className="text-sm font-bold text-[#092244] leading-tight">
                      {item.visaCategory.title}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">
                      {item.visaCategory.subCategory}
                    </div>
                  </div>
                </TableCell>

                {/* 4. Submission Date */}
                <TableCell className="px-6 py-4.5">
                  <div>
                    <div className="text-sm font-bold text-[#092244] leading-tight">
                      {item.submission.date}
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      by Agent: {item.submission.agentName}
                    </div>
                  </div>
                </TableCell>

                {/* 5. Status */}
                <TableCell className="px-6 py-4.5">
                  {getStatusBadge(item.status)}
                </TableCell>

                {/* 6. Actions */}
                <TableCell className="px-6 py-4.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onView?.(item)}
                      title="View Application Details"
                      className="h-8.5 w-8.5 rounded-full bg-[#FAF8F5] text-[#092244] hover:bg-[#F1F5F9] transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onMore?.(item)}
                      title="More Options"
                      className="h-8.5 w-8.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#092244] transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── CARD FOOTER / PAGINATION ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#F0ECE6] bg-white">
        <div className="text-xs text-[#64748B]">
          Showing{" "}
          <span className="font-bold text-[#092244]">1-10</span> of{" "}
          <span className="font-bold text-[#092244]">
            {totalCount.toLocaleString()}
          </span>{" "}
          applications
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(Math.max(1, activePage - 1))}
            disabled={activePage === 1}
            className="h-8 w-8 rounded-lg border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>

          <Button
            type="button"
            variant={activePage === 1 ? "default" : "ghost"}
            size="icon"
            onClick={() => handlePageClick(1)}
            className="h-8 w-8 text-xs font-bold"
          >
            1
          </Button>

          <Button
            type="button"
            variant={activePage === 2 ? "default" : "ghost"}
            size="icon"
            onClick={() => handlePageClick(2)}
            className="h-8 w-8 text-xs font-bold"
          >
            2
          </Button>

          <Button
            type="button"
            variant={activePage === 3 ? "default" : "ghost"}
            size="icon"
            onClick={() => handlePageClick(3)}
            className="h-8 w-8 text-xs font-bold"
          >
            3
          </Button>

          <span className="px-1 text-xs text-[#94A3B8]">...</span>

          <Button
            type="button"
            variant={activePage === totalPages ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePageClick(totalPages)}
            className="h-8 min-w-[32px] px-1.5 text-xs font-bold"
          >
            {totalPages}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePageClick(Math.min(totalPages, activePage + 1))}
            disabled={activePage === totalPages}
            className="h-8 w-8 rounded-lg border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5] disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
