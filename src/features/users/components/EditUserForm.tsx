"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loader } from "@/components/common/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  useGetUserByIdQuery,
  useGetUserPermissionsQuery,
  useUpdateUserMutation,
  useUpdateUserPermissionsMutation,
  BackendUser,
} from "@/services/api/users/usersApi";
import {
  useGetAllRolesQuery,
  useGetAllPermissionsQuery,
} from "@/services/api/roles/rolesApi";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Bangladesh",
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Singapore",
  "Malaysia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Ireland",
  "New Zealand",
  "Pakistan",
  "Philippines",
  "South Africa",
];

interface EditUserFormProps {
  userId: string;
}

export function EditUserForm({ userId }: EditUserFormProps) {
  const router = useRouter();

  // Status feedback
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Queries
  const {
    data: userResponse,
    isLoading: isUserLoading,
    isFetching,
    refetch: refetchUser,
  } = useGetUserByIdQuery(userId);

  const user: BackendUser | null = React.useMemo(() => {
    if (!userResponse) return null;
    if ("data" in userResponse && userResponse.data) {
      return userResponse.data as BackendUser;
    }
    if ("id" in userResponse) {
      return userResponse as unknown as BackendUser;
    }
    return null;
  }, [userResponse]);

  // Sync browser URL to clean clientId (e.g. ASK-2026-0001) if loaded via raw UUID
  React.useEffect(() => {
    if (user?.clientId && userId !== user.clientId && typeof window !== "undefined") {
      window.history.replaceState(null, "", `/users/${user.clientId}/edit`);
    }
  }, [user?.clientId, userId]);

  const [copiedId, setCopiedId] = React.useState(false);
  const handleCopyId = (idText: string) => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(idText);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const { data: userPermsResponse } = useGetUserPermissionsQuery(user?.id || "", {
    skip: !user?.id,
  });

  const { data: rolesResponse, isLoading: isRolesLoading } = useGetAllRolesQuery();
  const { data: permsResponse, isLoading: isPermsLoading } = useGetAllPermissionsQuery();

  const [updateUserMutation, { isLoading: isApiUpdating }] = useUpdateUserMutation();
  const [updateUserPermissionsMutation] = useUpdateUserPermissionsMutation();

  const availableRoles = rolesResponse?.data || [];
  const permissionGroups = permsResponse?.data || [];

  // Form states: Identity
  const [name, setName] = React.useState("");
  const [preferredName, setPreferredName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");

  // Form states: Contact & Location
  const [countryCode, setCountryCode] = React.useState("+1");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");

  // Role & Permissions
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [showCustomPermissions, setShowCustomPermissions] = React.useState(false);
  const [extraGrantedIds, setExtraGrantedIds] = React.useState<string[]>([]);
  const [deniedPermissionIds, setDeniedPermissionIds] = React.useState<string[]>([]);
  const [permissionsModified, setPermissionsModified] = React.useState(false);

  // Pre-populate when user data loads
  React.useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPreferredName(user.preferredName || "");
      setEmail(user.email || "");
      setStatus(user.status || "ACTIVE");
      setSelectedRoleId(user.roleId || user.role?.id || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setState(user.state || "");
      setPostalCode(user.postalCode || "");
      setCountry(user.country || "United States");

      // Parse WhatsApp
      if (user.whatsapp) {
        const parts = user.whatsapp.trim().split(" ");
        if (parts.length > 1 && parts[0].startsWith("+")) {
          setCountryCode(parts[0]);
          setWhatsappNumber(parts.slice(1).join(""));
        } else {
          setWhatsappNumber(user.whatsapp);
        }
      }
    }
  }, [user]);

  // Current selected role metadata and base capability IDs
  const currentRoleMeta = availableRoles.find(
    (r) => r.id === selectedRoleId || r.name === user?.role?.name
  );

  const rolePermissionIds = React.useMemo(() => {
    return new Set(currentRoleMeta?.permissions?.map((p) => p.id) || []);
  }, [currentRoleMeta]);

  // Handle role change
  const handleRoleChange = (newRoleId: string) => {
    setSelectedRoleId(newRoleId);
    setExtraGrantedIds([]);
    setDeniedPermissionIds([]);
    setPermissionsModified(true);
  };

  // Toggle permission override
  const handleTogglePermission = (permId: string) => {
    setPermissionsModified(true);
    const isRoleBase = rolePermissionIds.has(permId);

    if (isRoleBase) {
      setDeniedPermissionIds((prev) =>
        prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
      );
    } else {
      setExtraGrantedIds((prev) =>
        prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
      );
    }
  };

  // Effective capability count
  const effectiveCount = React.useMemo(() => {
    const baseCount = rolePermissionIds.size;
    const grantedCount = extraGrantedIds.length;
    const deniedCount = deniedPermissionIds.length;
    return Math.max(0, baseCount + grantedCount - deniedCount);
  }, [rolePermissionIds, extraGrantedIds, deniedPermissionIds]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Legal full name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update Core User Data
      await updateUserMutation({
        id: user.id,
        data: {
          name: name.trim(),
          preferredName: preferredName.trim() || undefined,
          password: password.trim() ? password.trim() : undefined,
          phone: phone.trim() || undefined,
          whatsapp: whatsappNumber.trim()
            ? `${countryCode} ${whatsappNumber.trim()}`
            : undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          country: country.trim() || undefined,
          roleId: selectedRoleId || undefined,
          status: status,
        },
      }).unwrap();

      // 2. Update Permission Overrides if modified
      if (permissionsModified) {
        await updateUserPermissionsMutation({
          id: user.id,
          permissionIds: extraGrantedIds,
          deniedPermissionIds: deniedPermissionIds,
        }).unwrap();
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      const targetSlug = user.clientId || user.id;
      setTimeout(() => {
        router.push(`/users/${targetSlug}`);
      }, 700);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const apiErr = err as { data?: { message?: string } };
      setErrorMessage(
        apiErr?.data?.message || "Failed to update user profile. Please check all fields."
      );
    }
  };

  const isPageLoading = isUserLoading || (isFetching && !user);

  if (isPageLoading) {
    return (
      <div className="py-24">
        <Loader
          size="lg"
          text="Loading user dossier..."
          subtext="Resolving profile credentials, PBAC role assignment, and access privileges."
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<User className="h-8 w-8 text-[#64748B]" />}
          title={`User "${userId}" Not Found`}
          description="The requested user account could not be located in the directory."
          action={
            <Button
              variant="default"
              onClick={() => router.push(ROUTES.USERS)}
              className="h-10 px-4 text-xs font-semibold"
            >
              Back to Directory
            </Button>
          }
        />
      </div>
    );
  }

  const displayIdentifier = user.clientId || user.id;
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. TOP BREADCRUMB & PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] shadow-2xs"
          >
            <Link href={`/users/${displayIdentifier}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to profile</span>
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
              <span>Security</span>
              <ChevronRight className="h-3 w-3" />
              <Link href={ROUTES.USERS} className="hover:text-[#0a0a0a]">
                Users
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/users/${displayIdentifier}`}
                className="font-mono text-[#0a0a0a] hover:underline font-bold"
              >
                {displayIdentifier}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#0284C7] font-black">Edit</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
                Edit User Profile
              </h1>
              <span className="font-mono text-xs font-bold text-[#0284C7] bg-[#F0F9FF] px-2.5 py-1 rounded-lg border border-[#0284C7]/20">
                {displayIdentifier}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => handleCopyId(displayIdentifier)}
            className="h-10 gap-2 px-3.5 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer shadow-2xs"
          >
            {copiedId ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#64748B]" />
                <span>Copy ID</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/users/${displayIdentifier}`)}
            className="h-10 px-4 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#0a0a0a] cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isApiUpdating}
            className="h-10 px-5 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
          >
            {isSubmitting || isApiUpdating ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="h-4 w-4 text-[#F3A712]" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3 text-xs text-[#065F46] font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0" />
          <span>User profile successfully updated! Redirecting to dossier...</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700 font-bold animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. MAIN GRID: 2-COLUMN LAYOUT */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: FORM SECTIONS (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: User Identity & Login Credentials */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    1. User Identity &amp; Profile Information
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Primary legal name, email, credentials, and account activity state
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    required
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Preferred Name / Alias
                  </label>
                  <Input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="e.g. Ellie"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      title="Email is the primary immutable authentication identifier"
                      className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F1ECE4]/50 border border-[#EAE6DF] text-xs font-bold text-[#64748B] cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-[#94A3B8]">
                    Primary login email (immutable identifier).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Reset Password <span className="text-[10px] font-normal text-[#64748B]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="h-11 pl-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                    />
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    Enter at least 6 characters only if resetting password.
                  </p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Account Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["ACTIVE", "INACTIVE", "SUSPENDED"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={cn(
                          "h-10 rounded-xl border text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
                          status === s
                            ? s === "ACTIVE"
                              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] ring-1 ring-[#059669]/20"
                              : s === "SUSPENDED"
                              ? "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] ring-1 ring-[#E11D48]/20"
                              : "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] ring-1 ring-[#475569]/20"
                            : "bg-[#FAF8F5] border-[#EAE6DF] text-[#64748B] hover:bg-white"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Location Intelligence */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    2. Contact &amp; Location Intelligence
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    WhatsApp direct channels, phone contact, and physical location
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-11 w-24 px-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none cursor-pointer shrink-0"
                    >
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+880">+880 (BD)</option>
                      <option value="+91">+91 (IN)</option>
                      <option value="+971">+971 (UAE)</option>
                      <option value="+966">+966 (SA)</option>
                      <option value="+49">+49 (DE)</option>
                      <option value="+33">+33 (FR)</option>
                      <option value="+65">+65 (SG)</option>
                    </select>
                    <Input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. 4165550192"
                      className="h-11 flex-1 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Alternative Direct Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (416) 555-0199"
                      className="h-11 pl-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Country of Origin / Residence
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Street Address
                  </label>
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 University Ave, Suite 500"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    City
                  </label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Toronto"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    State / Province &amp; Postal Code
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. ON"
                      className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                    />
                    <Input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. M5J 2P1"
                      className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Role Assignment & Granular PBAC Access */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF5FF] text-[#7E22CE]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                      3. Role Assignment &amp; Granular PBAC Access
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Policy-Based Access Control matrix and privilege customization
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-[#7E22CE] bg-[#FAF5FF] border border-[#E9D5FF] px-2.5 py-1 rounded-lg">
                  PBAC Engine
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Assigned Organizational Role <span className="text-rose-500">*</span>
                  </label>
                  {isRolesLoading ? (
                    <div className="h-11 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center px-3.5 text-xs text-[#64748B]">
                      Loading roles...
                    </div>
                  ) : (
                    <select
                      value={selectedRoleId}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none cursor-pointer"
                    >
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  )}
                  {currentRoleMeta && (
                    <p className="text-[11px] text-[#64748B]">
                      Role inherits <strong>{currentRoleMeta.permissions?.length || 0}</strong> standard capabilities.
                    </p>
                  )}
                </div>

                {/* Granular PBAC Override Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomPermissions(!showCustomPermissions)}
                    className="flex items-center gap-2 text-xs font-extrabold text-[#7E22CE] hover:text-[#6B21A8] transition-colors cursor-pointer"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        showCustomPermissions && "rotate-180"
                      )}
                    />
                    <span>
                      {showCustomPermissions
                        ? "Hide Granular Permission Overrides"
                        : "Configure Granular Permission Overrides (IAM)"}
                    </span>
                  </button>

                  {showCustomPermissions && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between text-xs text-[#64748B]">
                        <span className="font-semibold">
                          Click any permission chip to grant (+) or deny (-) overrides for this user.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setExtraGrantedIds([]);
                            setDeniedPermissionIds([]);
                            setPermissionsModified(true);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#64748B] hover:text-[#0a0a0a] cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset to Role Defaults</span>
                        </button>
                      </div>

                      {permissionGroups.map((group) => (
                        <div key={group.module} className="space-y-1.5">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                            {group.module} Capabilities
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {group.permissions.map((perm) => {
                              const isBase = rolePermissionIds.has(perm.id);
                              const isDenied = deniedPermissionIds.includes(perm.id);
                              const isGranted = extraGrantedIds.includes(perm.id);
                              const isActive = (isBase && !isDenied) || isGranted;

                              return (
                                <button
                                  key={perm.id}
                                  type="button"
                                  onClick={() => handleTogglePermission(perm.id)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors cursor-pointer",
                                    isActive
                                      ? isGranted
                                        ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                                        : "bg-white text-[#0a0a0a] border-[#CBD5E1]"
                                      : "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] opacity-60"
                                  )}
                                  title={perm.description || perm.name}
                                >
                                  {isActive ? (
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                                  ) : (
                                    <Minus className="h-3 w-3 text-[#E11D48]" />
                                  )}
                                  <span>{perm.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE USER PROFILE PREVIEW CARD (4 COLS) */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#F0ECE6]">
                <Sparkles className="h-4 w-4 text-[#F3A712]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  Profile Preview Card
                </h3>
              </div>

              {/* User Avatar & Header */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] text-white font-black text-sm shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-[#0a0a0a] truncate">
                    {name || "User Name"}
                  </h4>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {email || "email@domain.com"}
                  </p>
                </div>
              </div>

              {/* Role & Status Badges */}
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAF5FF] text-[#7E22CE] ring-1 ring-[#7E22CE]/20">
                  {currentRoleMeta?.name?.replace(/_/g, " ") || user.role?.name || "CONSULTANT"}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                    status === "ACTIVE"
                      ? "bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/20"
                      : status === "SUSPENDED"
                      ? "bg-[#FFF1F2] text-[#E11D48] ring-1 ring-[#E11D48]/20"
                      : "bg-[#F1F5F9] text-[#64748B] ring-1 ring-[#CBD5E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      status === "ACTIVE" ? "bg-[#059669]" : "bg-[#E11D48]"
                    )}
                  />
                  {status}
                </span>
              </div>

              {/* Contact Snapshot */}
              <div className="space-y-2 pt-3 border-t border-[#F0ECE6] text-xs text-[#64748B]">
                <div className="flex items-center justify-between">
                  <span>WhatsApp:</span>
                  <strong className="font-mono text-[#0a0a0a]">
                    {whatsappNumber ? `${countryCode} ${whatsappNumber}` : "Not configured"}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span>Country:</span>
                  <span className="font-bold text-[#0a0a0a]">{country}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Effective Capabilities:</span>
                  <span className="font-mono font-black text-[#059669]">
                    {effectiveCount} active
                  </span>
                </div>

                {user.clientId && (
                  <div className="flex items-center justify-between">
                    <span>Client Code:</span>
                    <span className="font-mono font-bold text-[#0284C7]">
                      {user.clientId}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting || isApiUpdating}
                className="w-full h-11 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
              >
                {isSubmitting || isApiUpdating ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-[#F3A712]" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
