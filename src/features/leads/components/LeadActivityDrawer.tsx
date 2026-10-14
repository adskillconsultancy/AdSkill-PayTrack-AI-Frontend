"use client";

import * as React from "react";
import {
  X,
  Phone,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Send,
  Building,
  MapPin,
  Globe,
  Share2,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  useAddLeadActivityMutation,
  useGetLeadByIdQuery,
  useUpdateLeadMutation,
} from "@/services/api/leads/leadsApi";
import type {
  CallOutcome,
  LeadActivityType,
  LeadStatus,
} from "../types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/useConfirm";

interface LeadActivityDrawerProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  staffList: { id: string; name: string; email: string }[];
  servicesList: { id: string; name: string }[];
}

export function LeadActivityDrawer({
  leadId,
  isOpen,
  onClose,
  staffList = [],
  servicesList = [],
}: LeadActivityDrawerProps) {
  const { user } = useAuth();

  const { data: leadResponse, isLoading: isLeadLoading } = useGetLeadByIdQuery(
    leadId || "",
    { skip: !leadId || !isOpen },
  );
  const lead = leadResponse?.data;

  const [addActivity, { isLoading: isAddingActivity }] =
    useAddLeadActivityMutation();
  const [updateLead, { isLoading: isUpdatingLead }] = useUpdateLeadMutation();
  const { confirm, alert } = useConfirm();

  // Activity form state
  const [activityType, setActivityType] =
    React.useState<LeadActivityType>("CALL");
  const [callOutcome, setCallOutcome] =
    React.useState<CallOutcome>("ANSWERED");
  const [notes, setNotes] = React.useState("");
  const [nextFollowUp, setNextFollowUp] = React.useState("");
  const [statusUpdate, setStatusUpdate] = React.useState<LeadStatus | "">("");
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>("");
  const [customStaffName, setCustomStaffName] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Set default acting staff to current user
  React.useEffect(() => {
    if (user?.id) {
      setSelectedStaffId(user.id);
      setCustomStaffName(user.name || "");
    }
  }, [user]);

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !leadId) return null;

  // Format WhatsApp Link
  const rawPhone = lead?.phone || "";
  const cleanedPhone = rawPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
    `Hello ${lead?.fullName || ""}, this is ${
      customStaffName || user?.name || "AdSkill"
    } from AdSkill Consultancy. I'm reaching out regarding your inquiry.`,
  )}`;

  const handleStaffChange = (staffId: string) => {
    setSelectedStaffId(staffId);
    const found = staffList.find((s) => s.id === staffId);
    if (found) {
      setCustomStaffName(found.name);
    }
  };

  const handleQuickStatusChange = async (newStatus: LeadStatus) => {
    if (!leadId) return;
    const isConfirmed = await confirm({
      title: "Update Lead Status?",
      message: `Are you sure you want to change lead status to ${newStatus}?`,
      confirmText: "Yes, Update Status",
      variant: "info",
    });
    if (!isConfirmed) return;

    try {
      await updateLead({
        id: leadId,
        data: { status: newStatus },
      }).unwrap();
      await alert({
        title: "Status Updated",
        message: `Lead status updated to ${newStatus}.`,
        variant: "success",
      });
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to update status";
      setFormError(msg);
      await alert({
        title: "Update Failed",
        message: msg,
        variant: "danger",
      });
    }
  };

  const handleQuickAssign = async (staffId: string) => {
    if (!leadId) return;
    const assignedStaff = staffList.find((s) => s.id === staffId);
    const staffName = assignedStaff ? assignedStaff.name : "Unassigned";
    const isConfirmed = await confirm({
      title: "Reassign Lead?",
      message: staffId
        ? `Are you sure you want to assign this lead to ${staffName}?`
        : "Are you sure you want to unassign this lead?",
      confirmText: staffId ? "Yes, Assign Staff" : "Yes, Unassign",
      variant: "info",
    });
    if (!isConfirmed) return;

    try {
      await updateLead({
        id: leadId,
        data: { assignedToId: staffId || null },
      }).unwrap();
      await alert({
        title: "Lead Reassigned",
        message: staffId ? `Lead assigned to ${staffName}.` : "Lead has been unassigned.",
        variant: "success",
      });
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to reassign lead";
      setFormError(msg);
      await alert({
        title: "Assignment Failed",
        message: msg,
        variant: "danger",
      });
    }
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!notes.trim() && activityType !== "CALL") {
      setFormError("Please enter notes or summary of the interaction.");
      return;
    }

    try {
      await addActivity({
        leadId,
        data: {
          activityType,
          callOutcome: activityType === "CALL" ? callOutcome : undefined,
          notes: notes.trim() || `Recorded ${activityType} interaction`,
          nextFollowUp: nextFollowUp || undefined,
          statusUpdate: statusUpdate || undefined,
          performedById: selectedStaffId || undefined,
          performedByName: customStaffName || user?.name || undefined,
        },
      }).unwrap();

      // Clear form
      setNotes("");
      setNextFollowUp("");
      setStatusUpdate("");
      await alert({
        title: "Activity Logged",
        message: "Interaction record has been saved to the lead history.",
        variant: "success",
      });
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Failed to record activity log";
      setFormError(msg);
      await alert({
        title: "Log Failed",
        message: msg,
        variant: "danger",
      });
    }
  };

  const getActivityBadge = (act: any) => {
    switch (act.activityType) {
      case "CALL":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Phone className="h-3 w-3" />
            Call: {act.callOutcome || "Completed"}
          </span>
        );
      case "WHATSAPP":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <MessageSquare className="h-3 w-3" />
            WhatsApp
          </span>
        );
      case "STATUS_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <CheckCircle2 className="h-3 w-3" />
            Status Change
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
            <FileText className="h-3 w-3" />
            Note
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-card border-l border-border/80 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
              Lead Activity & CRM Hub
            </span>
            <h2 className="text-lg font-extrabold text-foreground">
              {lead?.fullName || "Loading..."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isLeadLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading lead details and timeline...
            </div>
          ) : lead ? (
            <>
              {/* Quick Actions Card (WhatsApp & Call) */}
              <div className="rounded-2xl border border-border/80 bg-background p-4 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {lead.phone}
                    </span>
                    {lead.country && (
                      <span className="text-xs text-muted-foreground">
                        • {lead.country}
                      </span>
                    )}
                  </div>

                  {/* One-Click WhatsApp & Call Buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat WhatsApp
                    </a>
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Call
                    </a>
                  </div>
                </div>

                {/* Lead Context Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Service
                    </span>
                    <span className="font-semibold text-foreground">
                      {lead.service?.name || "Not Specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Referral Source
                    </span>
                    <span className="font-semibold text-foreground">
                      {lead.referralName || "Direct / None"}
                    </span>
                  </div>
                </div>

                {/* Quick Status & Assignee Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/60">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                      Current Status
                    </label>
                    <select
                      value={lead.status}
                      disabled={isUpdatingLead}
                      onChange={(e) =>
                        handleQuickStatusChange(e.target.value as LeadStatus)
                      }
                      className="w-full rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-bold text-foreground focus:border-primary">
                      <option value="NEW">New Lead</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="FOLLOW_UP">Follow-Up Needed</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                      Assigned Staff
                    </label>
                    <select
                      value={lead.assignedToId || ""}
                      disabled={isUpdatingLead}
                      onChange={(e) => handleQuickAssign(e.target.value)}
                      className="w-full rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-primary">
                      <option value="">-- Unassigned --</option>
                      {staffList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Form: Log Call or Activity */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Send className="h-4 w-4 text-primary" />
                    Record New Interaction / Call
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Logs acting staff automatically
                  </span>
                </div>

                {formError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-xs font-medium text-destructive">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmitActivity} className="space-y-3">
                  {/* Acting Staff Selector (Who is doing this update) */}
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Acting Staff (Who performed this call / update?)
                    </label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => handleStaffChange(e.target.value)}
                      className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary">
                      {staffList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Activity Type Selection Tabs */}
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">
                      Interaction Type
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { type: "CALL", label: "Phone Call", icon: Phone },
                        {
                          type: "WHATSAPP",
                          label: "WhatsApp",
                          icon: MessageSquare,
                        },
                        { type: "NOTE", label: "Note", icon: FileText },
                        { type: "MEETING", label: "Meeting", icon: Users },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = activityType === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() =>
                              setActivityType(item.type as LeadActivityType)
                            }
                            className={cn(
                              "flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-center text-xs font-semibold border transition-all",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                : "border-border/80 bg-background hover:bg-muted text-muted-foreground",
                            )}>
                            <Icon className="h-4 w-4" />
                            <span className="text-[11px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Call Outcome (If Call selected) */}
                  {activityType === "CALL" && (
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Call Outcome
                      </label>
                      <select
                        value={callOutcome}
                        onChange={(e) =>
                          setCallOutcome(e.target.value as CallOutcome)
                        }
                        className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary">
                        <option value="ANSWERED">Answered / Discussed</option>
                        <option value="NO_ANSWER">No Answer / Rang Out</option>
                        <option value="BUSY">Line Busy</option>
                        <option value="CALLBACK_REQUESTED">
                          Client Requested Callback
                        </option>
                        <option value="NOT_INTERESTED">Not Interested</option>
                        <option value="WRONG_NUMBER">Wrong Number</option>
                      </select>
                    </div>
                  )}

                  {/* Notes / Conversation Remarks */}
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Notes / What did the lead say?
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Discussed pricing for EB-2 NIW. Client requested proposal via WhatsApp by Friday."
                      className="w-full rounded-xl border border-border/80 bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  {/* Next Follow-Up Date & Status Transition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Next Follow-Up Date
                      </label>
                      <input
                        type="datetime-local"
                        value={nextFollowUp}
                        onChange={(e) => setNextFollowUp(e.target.value)}
                        className="w-full rounded-lg border border-border/80 bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Shift Status To
                      </label>
                      <select
                        value={statusUpdate}
                        onChange={(e) =>
                          setStatusUpdate(e.target.value as LeadStatus | "")
                        }
                        className="w-full rounded-lg border border-border/80 bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary">
                        <option value="">Keep Current ({lead.status})</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="FOLLOW_UP">Follow-Up Needed</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isAddingActivity}
                      className="w-full font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                      {isAddingActivity
                        ? "Saving Activity..."
                        : "Save Activity Log"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Activity History Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Activity Timeline ({lead.activities?.length || 0})
                  </h3>
                </div>

                {lead.activities && lead.activities.length > 0 ? (
                  <div className="space-y-3">
                    {lead.activities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-xl border border-border/80 bg-background p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {/* Staff Avatar / Initials */}
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {(act.performedByName || act.performedBy?.name || "S")[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-foreground">
                                {act.performedByName ||
                                  act.performedBy?.name ||
                                  "Staff"}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                {new Date(act.createdAt).toLocaleString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                          <div>{getActivityBadge(act)}</div>
                        </div>

                        {act.notes && (
                          <p className="text-xs text-foreground/90 leading-relaxed pl-9 whitespace-pre-wrap">
                            {act.notes}
                          </p>
                        )}

                        {act.nextFollowUp && (
                          <div className="flex items-center gap-1.5 pl-9 text-[11px] font-semibold text-amber-600">
                            <Clock className="h-3 w-3" />
                            <span>
                              Follow-up set for:{" "}
                              {new Date(act.nextFollowUp).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                    No activity logs recorded yet. Use the form above to log your first call or WhatsApp chat!
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-sm text-destructive">
              Lead not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
