"use client";

import * as React from "react";
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
import { EmptyState } from "@/components/common/EmptyState";
import { ChevronDown, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  title?: string;
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T, index: number) => string;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  itemLabel?: string;
  sortBy?: string;
  sortOptions?: string[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  headerAction?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  onSortChange?: (sort: string) => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  title = "RECORDS",
  data = [],
  columns = [],
  keyExtractor = (_, index) => index.toString(),
  totalCount,
  currentPage = 1,
  pageSize = 10,
  totalPages,
  itemLabel = "records",
  sortBy,
  sortOptions = ["Newest First", "Oldest First", "A to Z", "Z to A"],
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching your current filter criteria.",
  headerAction,
  className,
  tableClassName,
  onSortChange,
  onPageChange,
  onRowClick,
}: DataTableProps<T>) {
  const [selectedSort, setSelectedSort] = React.useState(
    sortBy || sortOptions[0] || "Newest First"
  );
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

  const total = totalCount !== undefined ? totalCount : data.length;
  const calculatedTotalPages =
    totalPages !== undefined ? totalPages : Math.max(1, Math.ceil(total / pageSize));

  // Close sort menu on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortSelect = (option: string) => {
    setSelectedSort(option);
    setIsSortOpen(false);
    onSortChange?.(option);
  };

  const handlePageClick = (page: number) => {
    if (page < 1 || page > calculatedTotalPages || page === currentPage) return;
    onPageChange?.(page);
  };

  // Pagination Window Generation: [1, 2, 3, '...', N]
  const getPaginationItems = () => {
    const pages: (number | string)[] = [];
    if (calculatedTotalPages <= 5) {
      for (let i = 1; i <= calculatedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", calculatedTotalPages);
      } else if (currentPage >= calculatedTotalPages - 2) {
        pages.push(
          1,
          "...",
          calculatedTotalPages - 2,
          calculatedTotalPages - 1,
          calculatedTotalPages
        );
      } else {
        pages.push(1, "...", currentPage, "...", calculatedTotalPages);
      }
    }
    return pages;
  };

  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <div
      className={cn(
        "w-full rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden",
        className
      )}
    >
      {/* ── 1. TABLE TOP BAR (TITLE + CONTROLS) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-[#F0ECE6] bg-white">
        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#092244]">
          {title}
        </h3>

        <div className="flex items-center gap-3">
          {headerAction}

          {/* Sort Dropdown */}
          {sortOptions && sortOptions.length > 0 && (
            <div className="relative" ref={sortRef}>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span className="font-medium">Sort by:</span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="inline-flex items-center gap-1 font-bold text-[#092244] hover:text-[#F3A712] transition-colors focus:outline-none cursor-pointer"
                >
                  <span>{selectedSort}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#64748B] transition-transform duration-200",
                      isSortOpen && "rotate-180"
                    )}
                  />
                </button>
              </div>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[#EAE6DF] bg-white p-1.5 shadow-lg z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSortSelect(opt)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs rounded-lg transition-colors font-medium flex items-center justify-between cursor-pointer",
                        selectedSort === opt
                          ? "bg-[#FAF8F5] text-[#092244] font-bold"
                          : "text-[#64748B] hover:bg-[#FAF8F5] hover:text-[#092244]"
                      )}
                    >
                      <span>{opt}</span>
                      {selectedSort === opt && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F3A712]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. RESPONSIVE TABLE WRAPPER ── */}
      <div className="overflow-x-auto">
        <Table
          containerClassName="border-none shadow-none rounded-none bg-transparent overflow-visible"
          className={cn("w-full border-none shadow-none rounded-none bg-white", tableClassName)}
        >
          <TableHeader className="bg-[#FAF8F5] border-b border-[#EAE6DF]">
            <TableRow className="border-b border-[#EAE6DF] hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-11 px-6 text-[11px] font-extrabold uppercase tracking-wider text-[#092244]",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-[#F0ECE6] bg-white">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="px-6 py-4.5">
                      <div className="h-5 bg-[#FAF8F5] rounded-md w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-6 py-12 text-center"
                >
                  <EmptyState
                    icon={<Inbox className="h-8 w-8 text-[#94A3B8]" />}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                const rowKey = keyExtractor(item, index);
                return (
                  <TableRow
                    key={rowKey}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "hover:bg-[#FAF8F5]/70 transition-colors border-b border-[#F0ECE6]",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col) => {
                      const cellContent = col.cell
                        ? col.cell(item, index)
                        : col.accessorKey
                        ? (item[col.accessorKey] as React.ReactNode)
                        : null;

                      return (
                        <TableCell
                          key={col.key}
                          className={cn(
                            "px-6 py-4.5",
                            col.align === "right"
                              ? "text-right"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left",
                            col.className
                          )}
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── 3. PAGINATION FOOTER ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#F0ECE6] bg-white">
        <div className="text-xs text-[#64748B]">
          Showing{" "}
          <span className="font-bold text-[#092244]">
            {total === 0 ? "0" : `${startIndex}-${endIndex}`}
          </span>{" "}
          of{" "}
          <span className="font-bold text-[#092244]">
            {total.toLocaleString()}
          </span>{" "}
          {itemLabel}
        </div>

        {/* Pagination Buttons */}
        {calculatedTotalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 rounded-lg border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>

            {/* Page Number Buttons */}
            {getPaginationItems().map((page, idx) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 text-xs text-[#94A3B8] select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(page);
              const isActive = currentPage === pageNum;

              return (
                <Button
                  key={`page-${pageNum}`}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  onClick={() => handlePageClick(pageNum)}
                  className={cn(
                    "h-8 min-w-[32px] px-2 text-xs font-bold rounded-lg cursor-pointer transition-all",
                    isActive
                      ? "bg-[#092244] text-white hover:bg-[#071933] shadow-xs"
                      : "text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5]"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}

            {/* Next Page Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage >= calculatedTotalPages}
              className="h-8 w-8 rounded-lg border-[#EAE6DF] bg-white text-[#64748B] hover:bg-[#FAF8F5] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
