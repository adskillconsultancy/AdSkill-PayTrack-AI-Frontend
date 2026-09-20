"use client";

import * as React from "react";
import {
  useGetCaseNotesQuery,
  useCreateCaseNoteMutation,
  useDeleteCaseNoteMutation,
} from "@/services/api/case-notes/caseNotesApi";
import type { NoteVisibility } from "@/types/case-note.types";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Globe,
  Shield,
  Lock,
  Pin,
  Plus,
  Trash2,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export interface CaseNotesTimelineProps {
  caseId: string;
  isClientAccount?: boolean;
  isSuperAdmin?: boolean;
}

export function CaseNotesTimeline({
  caseId,
  isClientAccount = false,
  isSuperAdmin = false,
}: CaseNotesTimelineProps) {
  const { user } = useAuth();
  const { data: notesResponse, isLoading, isFetching } = useGetCaseNotesQuery(caseId);
  const notes = notesResponse?.data || [];

  const [createNote, { isLoading: isPosting }] = useCreateCaseNoteMutation();
  const [deleteNote] = useDeleteCaseNoteMutation();

  // State
  const [activeFilter, setActiveFilter] = React.useState<
    "ALL" | "CLIENT" | "STAFF" | "SUPER_ADMIN"
  >("ALL");
  const [isComposerOpen, setIsComposerOpen] = React.useState(true);
  const [noteContent, setNoteContent] = React.useState("");
  const [selectedVisibility, setSelectedVisibility] = React.useState<NoteVisibility>(
    isClientAccount ? "CLIENT" : "STAFF"
  );
  const [isPinned, setIsPinned] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [actionNotice, setActionNotice] = React.useState<string>("");

  // Counts
  const clientNotesCount = notes.filter((n) => n.visibility === "CLIENT").length;
  const staffNotesCount = notes.filter((n) => n.visibility === "STAFF").length;
  const superAdminNotesCount = notes.filter((n) => n.visibility === "SUPER_ADMIN").length;

  // Filtered notes
  const filteredNotes = React.useMemo(() => {
    if (activeFilter === "ALL") return notes;
    return notes.filter((n) => n.visibility === activeFilter);
  }, [notes, activeFilter]);

  // Strip empty HTML tags to validate note content
  const isContentValid = React.useMemo(() => {
    const stripped = noteContent.replace(/<[^>]*>/g, "").trim();
    return stripped.length > 0;
  }, [noteContent]);

  const handlePostNote = async () => {
    if (!isContentValid || isPosting) return;
    setActionNotice("");

    try {
      await createNote({
        caseId,
        content: noteContent,
        visibility: isClientAccount ? "CLIENT" : selectedVisibility,
        isPinned,
      }).unwrap();

      setNoteContent("");
      setIsPinned(false);
      setActionNotice("Note posted successfully to timeline.");
      setTimeout(() => setActionNotice(""), 3500);
    } catch (err: any) {
      setActionNotice(
        err?.data?.message || err?.message || "Failed to post note. Please try again."
      );
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to remove this note from the timeline?")) return;
    setDeletingId(noteId);
    try {
      await deleteNote({ id: noteId, caseId }).unwrap();
      setActionNotice("Note removed from timeline.");
      setTimeout(() => setActionNotice(""), 3000);
    } catch (err: any) {
      setActionNotice(err?.data?.message || "Could not delete note");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-2xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Case Directives &amp; Activity Timeline</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                {notes.length} {notes.length === 1 ? "Update" : "Updates"}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological collaboration record with multi-tier role privacy &amp; rich formatting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            {isComposerOpen ? "Close Composer" : "Add Note"}
          </Button>
        </div>
      </div>

      {/* Notice bar if present */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center justify-between">
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice("")}
            className="text-amber-700 hover:text-amber-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Composer */}
      {isComposerOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Compose New Directive or Progress Update
            </span>

            {/* Visibility Selector */}
            {!isClientAccount && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedVisibility("CLIENT")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    selectedVisibility === "CLIENT"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  )}>
                  <Globe className="h-3 w-3" />
                  Client Portal
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVisibility("STAFF")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    selectedVisibility === "STAFF"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  )}>
                  <Shield className="h-3 w-3" />
                  Staff Only
                </button>

                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setSelectedVisibility("SUPER_ADMIN")}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                      selectedVisibility === "SUPER_ADMIN"
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    )}>
                    <Lock className="h-3 w-3" />
                    Super Admin
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            value={noteContent}
            onChange={setNoteContent}
            placeholder={
              selectedVisibility === "CLIENT"
                ? "Enter guidance, requirements, or updates visible to the client in their portal..."
                : selectedVisibility === "SUPER_ADMIN"
                  ? "Enter confidential executive notes, risk assessments, or private financial context..."
                  : "Enter internal case observations, caseworker notes, or operational updates (staff only)..."
            }
            minHeight="120px"
          />

          {/* Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span className="font-semibold flex items-center gap-1">
                  <Pin className="h-3 w-3 text-amber-700" />
                  Pin directive to top
                </span>
              </label>

              <span className="text-[11px] text-slate-500">
                Scope:{" "}
                <b className="text-slate-800">
                  {selectedVisibility === "CLIENT"
                    ? "Visible to Client & Staff"
                    : selectedVisibility === "SUPER_ADMIN"
                      ? "Super Admin Only (Restricted)"
                      : "Internal Staff Only"}
                </b>
              </span>
            </div>

            <Button
              type="button"
              disabled={!isContentValid || isPosting}
              onClick={handlePostNote}
              className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50">
              {isPosting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting...
                </span>
              ) : (
                "Post Note to Timeline"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
              activeFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            )}>
            <span>All Updates</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("CLIENT")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
              activeFilter === "CLIENT"
                ? "bg-white text-blue-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            )}>
            <Globe className="h-3 w-3 text-blue-600" />
            <span>Client Visible</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {clientNotesCount}
            </span>
          </button>

          {!isClientAccount && (
            <button
              type="button"
              onClick={() => setActiveFilter("STAFF")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                activeFilter === "STAFF"
                  ? "bg-white text-amber-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}>
              <Shield className="h-3 w-3 text-amber-600" />
              <span>Staff Only</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px]">
                {staffNotesCount}
              </span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveFilter("SUPER_ADMIN")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5",
                activeFilter === "SUPER_ADMIN"
                  ? "bg-white text-purple-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}>
              <Lock className="h-3 w-3 text-purple-600" />
              <span>Super Admin</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px]">
                {superAdminNotesCount}
              </span>
            </button>
          )}
        </div>

        {isFetching && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
            Syncing...
          </span>
        )}
      </div>

      {/* Timeline List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-amber-500" />
            <p>Loading timeline directives...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-800">
              {activeFilter === "ALL"
                ? "No directives or progress updates recorded yet."
                : `No ${activeFilter.toLowerCase()} notes found for this case.`}
            </h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Use the composer above to log client discussions, document requests, or internal casework decisions.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const authorInitials = (note.author?.name || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            const isAuthor = user?.id === note.authorId;
            const canDelete = isSuperAdmin || isAuthor;

            const isClientVis = note.visibility === "CLIENT";
            const isStaffVis = note.visibility === "STAFF";
            const isSuperVis = note.visibility === "SUPER_ADMIN";

            return (
              <div
                key={note.id}
                className={cn(
                  "rounded-2xl p-4 sm:p-5 border transition-all space-y-3",
                  note.isPinned
                    ? "bg-amber-50/30 border-amber-300/80 shadow-2xs ring-1 ring-amber-400/20"
                    : "bg-white border-slate-200 hover:border-slate-300",
                )}>
                {/* Note Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {authorInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-900 truncate">
                          {note.author?.name || "System User"}
                        </span>
                        {note.author?.role?.name && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {note.author.role.name}
                          </span>
                        )}
                        {note.isPinned && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scope Badge & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isClientVis && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase tracking-wider">
                        <Globe className="h-3 w-3" /> Client Visible
                      </span>
                    )}
                    {isStaffVis && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
                        <Shield className="h-3 w-3 text-amber-600" /> Staff Only
                      </span>
                    )}
                    {isSuperVis && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-extrabold uppercase tracking-wider">
                        <Lock className="h-3 w-3 text-purple-600" /> Super Admin
                      </span>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        disabled={deletingId === note.id}
                        title="Delete note"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                        {deletingId === note.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Formatted Content */}
                <div
                  className="text-xs text-slate-800 leading-relaxed prose prose-xs max-w-none pt-1 border-t border-slate-100"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
