"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  UserPlus,
  MessageCircle,
  Shield,
  KeyRound,
  Mail,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Globe,
  Plus,
  Minus,
  Sparkles,
  Layers,
  RotateCcw,
  MapPin,
  Building2,
  Lock,
  ExternalLink,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useCreateUserMutation } from "@/services/api/users/usersApi";
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

export function CreateUserForm() {
  const router = useRouter();

  // Form inputs: Identity
  const [name, setName] = React.useState("");
  const [preferredName, setPreferredName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("Password123!");
  const [status, setStatus] = React.useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">("ACTIVE");

  // Form inputs: Contact & Location
  const [countryCode, setCountryCode] = React.useState("+1");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");

  // Role & Permissions
  const [selectedRole, setSelectedRole] = React.useState("CONSULTANT");
  const [showCustomPermissions, setShowCustomPermissions] = React.useState(false);
  const [extraGrantedIds, setExtraGrantedIds] = React.useState<string[]>([]);
  const [deniedPermissionIds, setDeniedPermissionIds] = React.useState<string[]>([]);

  // Additional options
  const [sendWelcomeWhatsApp, setSendWelcomeWhatsApp] = React.useState(true);
  const [requirePasswordReset, setRequirePasswordReset] = React.useState(true);

  // Status feedback
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // API hooks
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetAllRolesQuery();
  const { data: permsResponse, isLoading: isPermsLoading } = useGetAllPermissionsQuery();
  const [createUser, { isLoading: isSubmitting }] = useCreateUserMutation();

  const availableRoles = rolesResponse?.data || [];
  const permissionGroups = permsResponse?.data || [];

  // Set default role when live roles load
  React.useEffect(() => {
    if (availableRoles.length > 0 && !availableRoles.some((r) => r.name === selectedRole)) {
      setSelectedRole(availableRoles[0].name);
    }
  }, [availableRoles, selectedRole]);

  // Current selected role metadata and base capability IDs
  const currentRoleMeta = availableRoles.find((r) => r.name === selectedRole);
  const rolePermissionIds = React.useMemo(() => {
    return new Set(currentRoleMeta?.permissions?.map((p) => p.id) || []);
  }, [currentRoleMeta]);

  // When role changes, reset overrides
  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    setExtraGrantedIds([]);
    setDeniedPermissionIds([]);
  };

  // Toggle permission logic (Grant vs Revoke)
  const handleTogglePermission = (permId: string) => {
    const isRoleBase = rolePermissionIds.has(permId);

    if (isRoleBase) {
      setDeniedPermissionIds((prev) =>
        prev.includes(permId)
          ? prev.filter((id) => id !== permId)
          : [...prev, permId]
      );
    } else {
      setExtraGrantedIds((prev) =>
        prev.includes(permId)
          ? prev.filter((id) => id !== permId)
          : [...prev, permId]
      );
    }
  };

  const handleResetOverrides = () => {
    setExtraGrantedIds([]);
    setDeniedPermissionIds([]);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!preferredName || preferredName === name.split(" ")[0]) {
      setPreferredName(val.split(" ")[0] || "");
    }
  };

  const effectiveCount =
    rolePermissionIds.size + extraGrantedIds.length - deniedPermissionIds.length;

  const initials = name.trim()
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "NU";

  const fullDisplayPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : undefined;
  const fullDisplayWhatsapp = whatsappNumber.trim()
    ? `${countryCode} ${whatsappNumber.trim()}`
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Full name is required");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email address is required");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      await createUser({
        name: name.trim(),
        preferredName: preferredName.trim() || undefined,
        email: email.trim().toLowerCase(),
        password: password,
        phone: fullDisplayPhone,
        whatsapp: fullDisplayWhatsapp,
        country: country.trim() || "United States",
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        roleName: selectedRole,
        status: status,
        permissionIds: extraGrantedIds.length > 0 ? extraGrantedIds : undefined,
        deniedPermissionIds: deniedPermissionIds.length > 0 ? deniedPermissionIds : undefined,
      }).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.USERS);
      }, 1200);
    } catch (err: unknown) {
      const apiErr = err as {
        data?: {
          message?: string;
          errorSources?: Array<{ path: string; message: string }>;
        };
      };

      if (apiErr?.data?.errorSources && apiErr.data.errorSources.length > 0) {
        setErrorMessage(
          `${apiErr.data.errorSources[0].path}: ${apiErr.data.errorSources[0].message}`
        );
      } else if (apiErr?.data?.message) {
        setErrorMessage(apiErr.data.message);
      } else {
        setErrorMessage("Failed to create user. Please check your connection.");
      }
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 🧭 1. TOP BREADCRUMB & PAGE HEADER (FULL WIDTH MATCHING USER DIRECTORY) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] shadow-2xs">
            <UserPlus className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
              Create New User Account
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Super Admin</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.USERS}
                className="hover:text-[#0a0a0a] transition-colors"
              >
                User Directory
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#0a0a0a] font-bold">New Account Registration</span>
            </div>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <Link href={ROUTES.USERS}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to User Directory</span>
          </Link>
        </Button>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#059669]/30 text-[#059669] flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-xs font-bold">
            User account created successfully! Redirecting to User Directory...
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="text-xs font-bold">{errorMessage}</div>
        </div>
      )}

      {/* 📋 2. FULL 2-COLUMN RESPONSIVE LAYOUT (FORM + LIVE PROFILE PREVIEW) */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Details Column (2 Columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Identity & Credentials */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#0a0a0a]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    1. Identity &amp; Account Credentials
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Legal full name, portal sign-in email, and security password
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Legal Full Name *
                  </label>
                  <Input
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Preferred Name / Nickname
                  </label>
                  <Input
                    placeholder="Enter nickname (optional)"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <Input
                      required
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Temporary Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <Input
                      required
                      type="text"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Account Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED")}
                    className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Full Access)</option>
                    <option value="INACTIVE">Inactive (Pending Confirmation)</option>
                    <option value="SUSPENDED">Suspended (Restricted)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Physical Location */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    2. Contact &amp; Physical Location
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Direct phone line, WhatsApp contact, and registered physical address
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Country of Residence
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Country Code
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-mono font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] cursor-pointer"
                  >
                    <option value="+1">+1 (USA / Canada)</option>
                    <option value="+880">+880 (Bangladesh)</option>
                    <option value="+44">+44 (United Kingdom)</option>
                    <option value="+61">+61 (Australia)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+91">+91 (India)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Direct Phone Line
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <Input
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 pl-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    WhatsApp Number
                  </label>
                  <Input
                    placeholder="WhatsApp number"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#059669] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                    <Input
                      placeholder="Street address (optional)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-11 pl-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    City
                  </label>
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    State / Province &amp; Postal Code
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                    />
                    <Input
                      placeholder="Postal Code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Role & Permission Assignment */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF5FF] text-[#7E22CE]">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    3. Role &amp; Access Level
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Select system role and configure granular capability overrides (Grant or Revoke)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Assigned Role *
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={isRolesLoading}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] cursor-pointer"
                  >
                    {isRolesLoading ? (
                      <option>Loading roles...</option>
                    ) : (
                      availableRoles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name.replace(/_/g, " ")}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Role Info Callout */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed">
                  <div>
                    <span className="font-bold text-[#0a0a0a]">
                      Role: {selectedRole.replace(/_/g, " ")}
                    </span>
                    {currentRoleMeta?.permissions?.length ? (
                      <span className="text-[#64748B]">
                        {" "}— Provides {currentRoleMeta.permissions.length} standard role capabilities.
                      </span>
                    ) : (
                      <span className="text-[#64748B]"> — Standard permissions apply.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {extraGrantedIds.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284C7] bg-[#F0F9FF] px-2.5 py-0.5 rounded-lg border border-[#0284C7]/20 shrink-0">
                        <Plus className="h-3 w-3" />
                        +{extraGrantedIds.length} Added
                      </span>
                    )}
                    {deniedPermissionIds.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E11D48] bg-[#FFF1F2] px-2.5 py-0.5 rounded-lg border border-[#E11D48]/20 shrink-0">
                        <Minus className="h-3 w-3" />
                        -{deniedPermissionIds.length} Revoked
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-[#0a0a0a] bg-white px-2 py-0.5 rounded-lg border border-[#EAE6DF]">
                      Total: {effectiveCount} Active
                    </span>
                  </div>
                </div>

                {/* Expandable Custom Permission Overrides Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomPermissions(!showCustomPermissions)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#EAE6DF] bg-white hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 text-xs font-bold text-[#0a0a0a]">
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg border border-[#EAE6DF] bg-[#FAF8F5] transition-transform text-[#0a0a0a]",
                        showCustomPermissions && "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                      )}>
                        {showCustomPermissions ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="text-left">
                        <div>Customize Permissions for this User (Add or Remove)</div>
                        <div className="text-[11px] text-[#64748B] font-normal">
                          Grant extra capabilities or turn OFF specific role permissions for this account
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#0284C7]">
                        {showCustomPermissions ? "Hide Overrides" : "Customize"}
                      </span>
                    </div>
                  </button>

                  {/* Custom Permissions Selection Panel */}
                  {showCustomPermissions && (
                    <div className="mt-3 p-4 sm:p-5 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE6DF]">
                        <div className="text-xs text-[#64748B] leading-relaxed">
                          Check or uncheck capabilities below. Unchecking a role permission will <strong className="text-[#E11D48]">REVOKE</strong> it; checking an unassigned capability will <strong className="text-[#0284C7]">GRANT</strong> it.
                        </div>
                        {(extraGrantedIds.length > 0 || deniedPermissionIds.length > 0) && (
                          <button
                            type="button"
                            onClick={handleResetOverrides}
                            className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:underline cursor-pointer shrink-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset to Role Defaults</span>
                          </button>
                        )}
                      </div>

                      {isPermsLoading ? (
                        <div className="py-6 text-center text-xs text-[#64748B]">
                          Loading system capabilities...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {permissionGroups.map((group) => {
                            return (
                              <div key={group.module} className="p-3.5 rounded-xl bg-white border border-[#EAE6DF] space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black uppercase tracking-wider text-[#0a0a0a] flex items-center gap-1.5">
                                    <Layers className="h-3 w-3 text-[#64748B]" />
                                    <span>{group.module} MODULE</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-[#94A3B8]">
                                    {group.permissions.length} capabilities
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {group.permissions.map((perm) => {
                                    const isRoleBase = rolePermissionIds.has(perm.id);
                                    const isRevoked = deniedPermissionIds.includes(perm.id);
                                    const isExtraGranted = extraGrantedIds.includes(perm.id);
                                    const isActive = isRoleBase ? !isRevoked : isExtraGranted;

                                    return (
                                      <label
                                        key={perm.id}
                                        className={cn(
                                          "p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer select-none",
                                          isRevoked
                                            ? "bg-rose-50/60 border-rose-200 text-[#E11D48]"
                                            : isExtraGranted
                                            ? "bg-[#F0F9FF] border-[#0284C7]/40 text-[#0a0a0a] shadow-2xs"
                                            : isRoleBase
                                            ? "bg-[#FAF8F5] border-[#EAE6DF] text-[#0a0a0a]"
                                            : "bg-white border-[#EAE6DF] text-[#64748B] hover:border-[#0a0a0a]/30"
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isActive}
                                          onChange={() => handleTogglePermission(perm.id)}
                                          className="mt-0.5 h-4 w-4 rounded text-[#0a0a0a] focus:ring-[#0a0a0a] cursor-pointer"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={cn(
                                              "font-mono font-bold text-[11px]",
                                              isRevoked ? "line-through text-[#E11D48]" : "text-[#0a0a0a]"
                                            )}>
                                              {perm.name}
                                            </span>

                                            {isRevoked ? (
                                              <span className="text-[9px] font-bold text-[#E11D48] bg-[#FFF1F2] px-1.5 py-0.2 rounded border border-[#E11D48]/30">
                                                ✕ Revoked from Role
                                              </span>
                                            ) : isExtraGranted ? (
                                              <span className="text-[9px] font-bold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.2 rounded border border-[#0284C7]/30">
                                                + Extra Granted
                                              </span>
                                            ) : isRoleBase ? (
                                              <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#059669]/20">
                                                ✓ Role Default
                                              </span>
                                            ) : null}
                                          </div>
                                          {perm.description && (
                                            <p className="text-[10px] text-[#64748B] leading-tight mt-0.5 truncate" title={perm.description}>
                                              {perm.description}
                                            </p>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (Sticky Live Profile Preview & Actions) */}
          <div className="lg:sticky lg:top-20 space-y-6 self-start">
            {/* Live User Profile Preview Card */}
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#F3A712]" />
                  <span>Live Dossier Preview</span>
                </h4>
                <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a]/10 text-lg font-black text-[#0a0a0a] border-2 border-[#FAF8F5] shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-base font-black text-[#0a0a0a] truncate">
                    {name.trim() || "New User"}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
                      {selectedRole.replace(/_/g, " ")}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-mono font-bold text-[#0284C7] bg-[#F0F9FF] px-2 py-0.5 rounded-md border border-[#0284C7]/20">
                      Auto-Assigned ID
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>Email:</span>
                  <span className="font-bold text-[#0a0a0a] truncate max-w-[170px]" title={email}>
                    {email || "name@example.com"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>WhatsApp:</span>
                  <span className="font-mono font-bold text-[#059669]">
                    {whatsappNumber ? `${countryCode} ${whatsappNumber}` : "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>Country:</span>
                  <span className="font-bold text-[#0a0a0a]">{country}</span>
                </div>
                <div className="flex items-center justify-between text-[#64748B] pt-1 border-t border-[#EAE6DF]">
                  <span>Granted Powers:</span>
                  <span className="font-mono font-bold text-[#0284C7]">
                    {effectiveCount} capabilities
                  </span>
                </div>
              </div>

              {whatsappNumber && (
                <div className="pt-1">
                  <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#25D366]/30 text-xs font-bold text-[#059669] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 fill-current" />
                      <span>WhatsApp Direct Ready</span>
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>

            {/* Onboarding & Password Options */}
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a] flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-[#D97706]" />
                <span>Onboarding &amp; Credentials</span>
              </h4>

              <div className="space-y-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                  <input
                    type="checkbox"
                    checked={sendWelcomeWhatsApp}
                    onChange={(e) => setSendWelcomeWhatsApp(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#0a0a0a] focus:ring-[#0a0a0a]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#0a0a0a] block">
                      Send WhatsApp Welcome
                    </span>
                    <span className="text-[#64748B] text-[11px] leading-tight block mt-0.5">
                      Dispatch credentials and PIN to {whatsappNumber ? `${countryCode} ${whatsappNumber}` : "contact"}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                  <input
                    type="checkbox"
                    checked={requirePasswordReset}
                    onChange={(e) => setRequirePasswordReset(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#0a0a0a] focus:ring-[#0a0a0a]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#0a0a0a] block">
                      Require Password Change
                    </span>
                    <span className="text-[#64748B] text-[11px] leading-tight block mt-0.5">
                      User must choose a new password on first login
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Bar (Sticky / Prominent) */}
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-sm font-bold shadow-md cursor-pointer gap-2"
              >
                <UserPlus className="h-4.5 w-4.5 text-[#F3A712]" />
                <span>{isSubmitting ? "Creating User..." : "Save & Create User"}</span>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-10 rounded-xl text-xs font-bold"
              >
                <Link href={ROUTES.USERS}>Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
