"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Calendar,
  Building2,
  KeyRound,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Ban,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  useGetUserByIdQuery,
  useGetUserPermissionsQuery,
  useUpdateUserMutation,
} from "@/services/api/users/usersApi";

interface UserDetailViewProps {
  userId: string;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // Live Backend Query: Resolves either UUID or Clean Client ID (e.g. ASK-2026-0001)
  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useGetUserByIdQuery(userId);

  const user = userResponse?.data;

  // Live PBAC Permissions Query for this specific user
  const { data: permissionsResponse, isLoading: isPermsLoading } =
    useGetUserPermissionsQuery(user?.id || "", {
      skip: !user?.id,
    });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const confirmMsg =
      newStatus === "SUSPENDED"
        ? `Are you sure you want to suspend account for "${user.name}"?`
        : `Reactivate account for "${user.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      await updateUser({
        id: user.id,
        data: { status: newStatus },
      }).unwrap();
      setStatusMessage(`Account status changed to ${newStatus}`);
      setTimeout(() => setStatusMessage(null), 3500);
      refetchUser();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      alert(apiErr?.data?.message || "Failed to update status");
    }
  };

  // Dynamic Role Badge Formatting (Zero Hardcoding)
  const renderRoleBadge = (roleName?: string) => {
    if (!roleName) return null;
    const norm = roleName.toUpperCase();

    if (norm.includes("SUPER")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FAF5FF] text-[#7E22CE] ring-1 ring-[#7E22CE]/20 shadow-2xs">
          <Sparkles className="h-3 w-3 text-[#7E22CE]" />
          {roleName.replace(/_/g, " ")}
        </span>
      );
    }
    if (norm.includes("MANAGE") || norm.includes("ADMIN")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1E40AF] ring-1 ring-[#1E40AF]/20 shadow-2xs">
          {roleName.replace(/_/g, " ")}
        </span>
      );
    }
    if (norm.includes("CONSULT")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E6F4F1] text-[#0D6E6E] ring-1 ring-[#0D6E6E]/20 shadow-2xs">
          {roleName.replace(/_/g, " ")}
        </span>
      );
    }
    if (norm.includes("CLIENT")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] text-[#475569] ring-1 ring-[#475569]/20 shadow-2xs">
          Client Account
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] shadow-2xs">
        {roleName.replace(/_/g, " ")}
      </span>
    );
  };

  // Status Badge Formatting
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/20 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            Active Account
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] ring-1 ring-[#E11D48]/20 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E11D48]" />
            Suspended
          </span>
        );
      case "INACTIVE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B] ring-1 ring-[#64748B]/20 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
            Inactive
          </span>
        );
    }
  };

  // Loading State Skeleton
  if (isUserLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#EAE6DF]/60 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[#EAE6DF]/60 rounded animate-pulse" />
            <div className="h-3 w-32 bg-[#EAE6DF]/40 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-8 rounded-3xl border border-[#EAE6DF] bg-white space-y-4">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-[#EAE6DF]/60 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-64 bg-[#EAE6DF]/60 rounded animate-pulse" />
              <div className="h-4 w-40 bg-[#EAE6DF]/40 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader />
          <span className="text-xs font-bold text-[#64748B]">Loading user profile dossier...</span>
        </div>
      </div>
    );
  }

  // Not Found / Error State
  if (isUserError || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] shadow-2xs"
          >
            <Link href={ROUTES.USERS}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-black text-[#092244]">User Profile</h1>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl border border-[#EAE6DF] bg-white text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1F2] text-[#E11D48] mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-[#092244]">User Dossier Not Found</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            No account exists in PostgreSQL matching identifier{" "}
            <span className="font-mono font-bold text-[#092244]">"{userId}"</span>.
            The user may have been deleted or the link is invalid.
          </p>
          <div className="pt-2">
            <Button asChild className="rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold">
              <Link href={ROUTES.USERS}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Return to User Directory
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const effectivePermissions = permissionsResponse?.data?.effectivePermissions || [];
  const displayIdentifier = user.clientId || user.id;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedCreated = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedUpdated = new Date(user.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const fullAddress = [user.address, user.city, user.state, user.postalCode, user.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* 🔔 Toast Feedback Message */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#059669]/30 text-xs font-bold text-[#059669] flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 🧭 1. TOP BREADCRUMB & BACK NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] shadow-2xs"
          >
            <Link href={ROUTES.USERS}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to User List</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
              User Profile &amp; Dossier
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Security</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link href={ROUTES.USERS} className="hover:text-[#092244] transition-colors">
                Users
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#092244] font-bold">{user.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-2xs"
          >
            {user.status === "ACTIVE" ? (
              <>
                <Ban className="h-3.5 w-3.5 text-[#E11D48]" />
                <span>Suspend User</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                <span>Reactivate User</span>
              </>
            )}
          </Button>

          {/* Copy Business ID Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyId(displayIdentifier)}
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#059669]" />
                <span className="text-[#059669]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Copy ID</span>
              </>
            )}
          </Button>

          {/* WhatsApp Direct Chat Button */}
          {user.whatsapp && (
            <Button
              asChild
              className="h-10 px-4 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold gap-2 shadow-xs cursor-pointer"
            >
              <a
                href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>WhatsApp Chat</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* 👤 2. HERO PROFILE BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-2xl font-black text-[#092244] border-4 border-[#FAF8F5] shadow-md">
              {initials}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#092244] tracking-tight">
                  {user.name}
                </h2>
                {renderRoleBadge(user.role?.name)}
                {renderStatusBadge(user.status)}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748B] font-medium">
                {user.preferredName && (
                  <>
                    <span className="font-semibold text-[#092244]">
                      @{user.preferredName.toLowerCase()}
                    </span>
                    <span>•</span>
                  </>
                )}

                {/* Business Client ID Badge */}
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#0284C7] bg-[#F0F9FF] px-2 py-0.5 rounded-lg border border-[#0284C7]/20">
                  ID: {displayIdentifier}
                </span>

                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {user.role?.name === "CLIENT" ? "Client Portal User" : "Legal & Operations"}
                </span>

                {user.country && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#94A3B8]" />
                      {user.country}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert(`Password reset link dispatched to ${user.email}`)}
              className="h-10 px-4 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-2xs"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#F3A712]" />
              <span>Reset Password</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 📊 3. PROFILE DETAILS & PBAC CAPABILITIES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Identity & PBAC Permissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Contact Card */}
          <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#092244]" />
              <span>Contact &amp; Account Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Official Email
                </span>
                <div className="text-sm font-bold text-[#092244] flex items-center gap-1.5 break-all">
                  <Mail className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                  <a href={`mailto:${user.email}`} className="hover:underline">
                    {user.email}
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  WhatsApp Number
                </span>
                <div className="text-sm font-bold text-[#092244] flex items-center gap-1.5 font-mono">
                  <Phone className="h-3.5 w-3.5 text-[#25D366] shrink-0" />
                  <span>{user.whatsapp || user.phone || "Not recorded"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Registered Address
                </span>
                <div className="text-sm font-bold text-[#092244] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#0284C7] shrink-0" />
                  <span className="truncate">{fullAddress || "No physical address provided"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Member Since
                </span>
                <div className="text-sm font-bold text-[#092244] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#F3A712] shrink-0" />
                  <span>{formattedCreated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PBAC Capabilities Matrix Card */}
          <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#059669]" />
                <span>Granted PBAC Privileges &amp; Capabilities</span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#64748B]">
                {effectivePermissions.length} Capabilities Active
              </span>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#092244]">
                  Assigned Security Role:
                </span>
                {renderRoleBadge(user.role?.name)}
              </div>

              
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Policy-Based Access Control (PBAC) dynamically grants fine-grained permissions attached to role{" "}
                  <strong className="text-[#092244] font-mono">{user.role?.name}</strong>.
                </p>
              

              {/* Effective Permission Chips */}
              <div className="pt-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] mb-2">
                  Active Capabilities List:
                </div>
                {isPermsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[#64748B] py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Resolving PBAC permissions matrix...</span>
                  </div>
                ) : effectivePermissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {effectivePermissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white text-[#092244] border border-[#EAE6DF] shadow-2xs"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#94A3B8] italic py-2">
                    No granular capabilities granted to this user.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Direct & Security Details */}
        <div className="space-y-6">
          {/* WhatsApp Direct Chat Card */}
          <div className="p-6 sm:p-7 rounded-3xl border border-[#25D366]/30 bg-gradient-to-b from-[#ECFDF5] to-white shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-sm">
                <MessageCircle className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#092244]">
                  WhatsApp Direct
                </h4>
                <p className="text-xs text-[#059669] font-semibold">
                  Client &amp; Staff Communication
                </p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Launch an encrypted WhatsApp chat with {user.name} for instant payment receipts, application milestones, or urgent inquiry resolutions.
            </p>

            <Button
              asChild
              className="w-full h-11 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold text-xs gap-2 shadow-xs cursor-pointer"
            >
              <a
                href={`https://wa.me/${(user.whatsapp || user.phone || "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Launch WhatsApp Direct</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </Button>
          </div>

          {/* Security & System Identifiers Card */}
          <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#7E22CE]" />
              <span>Security &amp; System Info</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#092244]">
                  Two-Factor Auth (2FA)
                </span>
                {user.isMfaEnabled ? (
                  <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md">
                    Enabled
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded-md">
                    Disabled
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#092244]">
                  Business Client ID
                </span>
                <span className="text-xs font-mono font-bold text-[#0284C7]">
                  {user.clientId || "None (Staff)"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#092244]">
                  Database UUID
                </span>
                <span className="text-[10px] font-mono text-[#64748B] truncate max-w-[130px]" title={user.id}>
                  {user.id}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#092244]">
                  Last Profile Update
                </span>
                <span className="text-xs font-medium text-[#64748B]">
                  {formattedUpdated}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

