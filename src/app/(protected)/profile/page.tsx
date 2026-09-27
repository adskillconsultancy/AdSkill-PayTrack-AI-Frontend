"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSetupMfaMutation,
  useEnableMfaMutation,
  useDisableMfaMutation,
} from "@/services/api/auth/authApi";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

type TabKey = "PROFILE" | "SECURITY";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { data: profileData, isLoading: isProfileLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [setupMfa, { isLoading: isSettingUpMfa }] = useSetupMfaMutation();
  const [enableMfa, { isLoading: isEnablingMfa }] = useEnableMfaMutation();
  const [disableMfa, { isLoading: isDisablingMfa }] = useDisableMfaMutation();

  const [mfaSecretData, setMfaSecretData] = React.useState<{ secret: string; otpAuthUrl: string; instructions: string } | null>(null);
  const [mfaVerifyCode, setMfaVerifyCode] = React.useState("");
  const [mfaDisablePassword, setMfaDisablePassword] = React.useState("");
  const [mfaSuccessMsg, setMfaSuccessMsg] = React.useState<string | null>(null);
  const [mfaErrorMsg, setMfaErrorMsg] = React.useState<string | null>(null);
  const [showDisableConfirm, setShowDisableConfirm] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<TabKey>("PROFILE");
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Profile Form State
  const [formData, setFormData] = React.useState({
    name: "",
    preferredName: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    country: "",
  });
  const [profileSuccess, setProfileSuccess] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  // Password Form State
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  // Populate data when loaded
  React.useEffect(() => {
    if (profileData?.data) {
      const p: any = profileData.data;
      setFormData({
        name: p.name || p.fullName || "",
        preferredName: p.preferredName || "",
        phone: p.phone || "",
        whatsapp: p.whatsapp || "",
        address: p.address || "",
        city: p.city || "",
        country: p.country || "",
      });
    }
  }, [profileData]);

  const user: any = profileData?.data || authUser;
  const userName = user?.name || user?.fullName || "AdSkill Client";
  const userRole = typeof user?.role === "object" ? user.role?.name : user?.role || "CLIENT";
  const clientIdentifier = user?.customClientId || user?.clientId || "N/A";

  const handleCopy = (text: string, field: string) => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    try {
      await updateProfile(formData).unwrap();
      setProfileSuccess(true);
      refetch();
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();

      setPasswordSuccess(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err?.data?.message || "Failed to update password. Verify current password.");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 🧭 Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-2">
            <UserCheck className="h-3.5 w-3.5" /> Account & Credentials
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Personal Profile & Security
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal contact details, verified AdSkill identifier, and account security.
          </p>
        </div>

        {/* Action Button linking to Dedicated Support Route */}
        <div className="flex items-center gap-3">
          <Link href={ROUTES.SUPPORT}>
            <Button variant="outline" className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10">
              <HelpCircle className="h-4 w-4" /> Support & Advisory Hub <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 💡 Friendly Banner Linking to Dedicated Support Route */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Need assistance or want to speak with your consultant?</h4>
            <p className="text-xs text-muted-foreground">
              Direct WhatsApp chat, active application status, ticket submission, and FAQs are now in the Support Hub.
            </p>
          </div>
        </div>
        <Link href={ROUTES.SUPPORT}>
          <Button size="sm" className="gap-2 text-xs font-semibold whitespace-nowrap">
            Open Support Hub <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* 💳 Identity Card Banner */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-black text-3xl shadow-lg ring-4 ring-background">
              {userName ? userName[0].toUpperCase() : "U"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary uppercase">
                  {userRole}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {/* Custom Client ID */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/50">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Client ID</div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs font-mono font-bold text-primary">
                  {clientIdentifier}
                </span>
                {clientIdentifier !== "N/A" && (
                  <button
                    onClick={() => handleCopy(clientIdentifier, "clientId")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copiedField === "clientId" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/50">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-foreground">
                  {user?.status || "ACTIVE"}
                </span>
              </div>
            </div>

            {/* Member Since */}
            <div className="p-3 rounded-xl bg-background/80 border border-border/50 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Member Since</div>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recent"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎛️ Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("PROFILE")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
            activeTab === "PROFILE"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <User className="h-4 w-4" /> Personal Information
        </button>
        <button
          onClick={() => setActiveTab("SECURITY")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
            activeTab === "SECURITY"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Lock className="h-4 w-4" /> Password & Security
        </button>
      </div>

      {/* 📝 TAB 1: PERSONAL INFORMATION */}
      {activeTab === "PROFILE" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Edit Personal Details</h3>
              <p className="text-xs text-muted-foreground">
                Keep your contact numbers and address up to date for invoices and advisory contact.
              </p>
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>Your profile details have been saved successfully!</span>
            </div>
          )}

          {profileError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Preferred Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Preferred / Calling Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={formData.preferredName}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border/40 bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Email updates require administrator verification.
                </span>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Primary Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+880 1700-000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="+880 1700-000000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Dhaka"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Bangladesh"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Residential / Billing Address
                </label>
                <input
                  type="text"
                  placeholder="House 12, Road 4, Sector 7, Uttara"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="gap-2 text-xs min-w-[140px]"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Save Profile Details
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 🔐 TAB 2: SECURITY & PASSWORD */}
      {activeTab === "SECURITY" && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Change Password</h3>
              <p className="text-xs text-muted-foreground">
                Enhance your account safety by updating your password periodically.
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>Your password has been changed securely. Use your new password on next login.</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Must be at least 6 characters with a combination of letters and numbers.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                className="gap-2 text-xs min-w-[140px]"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" /> Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

          {/* 🛡️ Two-Factor Authentication (MFA / 2FA) Card */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-muted-foreground">
                  Protect your account with RFC 6238 time-based one-time passwords (TOTP).
                </p>
              </div>
            </div>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold",
              user?.isMfaEnabled
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-muted text-muted-foreground border border-border"
            )}>
              {user?.isMfaEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {mfaSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{mfaSuccessMsg}</span>
            </div>
          )}

          {mfaErrorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{mfaErrorMsg}</span>
            </div>
          )}

          {user?.isMfaEnabled ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Two-Factor Authentication is currently active on your account. Every sign-in requires both your password and an authenticator code.
              </p>

              {!showDisableConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => setShowDisableConfirm(true)}
                >
                  Disable Two-Factor Authentication
                </Button>
              ) : (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                  <p className="text-xs font-semibold text-rose-900">
                    To disable 2FA, please enter your current account password:
                  </p>
                  <input
                    type="password"
                    placeholder="Current password"
                    value={mfaDisablePassword}
                    onChange={(e) => setMfaDisablePassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={isDisablingMfa || !mfaDisablePassword}
                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
                      onClick={async () => {
                        setMfaErrorMsg(null);
                        try {
                          await disableMfa({ password: mfaDisablePassword }).unwrap();
                          setMfaSuccessMsg("Two-Factor Authentication has been successfully disabled.");
                          setShowDisableConfirm(false);
                          setMfaDisablePassword("");
                          refetch();
                        } catch (err: any) {
                          setMfaErrorMsg(err?.data?.message || "Failed to disable 2FA. Verify password.");
                        }
                      }}
                    >
                      {isDisablingMfa ? "Disabling..." : "Confirm & Disable 2FA"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setShowDisableConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!mfaSecretData ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add an extra layer of security. Use an authenticator app such as Google Authenticator, Microsoft Authenticator, or Authy.
                  </p>
                  <Button
                    type="button"
                    disabled={isSettingUpMfa}
                    className="gap-2 text-xs"
                    onClick={async () => {
                      setMfaErrorMsg(null);
                      try {
                        const res = await setupMfa().unwrap();
                        setMfaSecretData(res.data);
                      } catch (err: any) {
                        setMfaErrorMsg(err?.data?.message || "Failed to generate 2FA secret.");
                      }
                    }}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {isSettingUpMfa ? "Initializing..." : "Setup Two-Factor Authentication"}
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground">Step 1: Save Your Secret Key</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Enter this secret key in your authenticator app (Google Authenticator, Authy, etc.):
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="px-3 py-1.5 rounded-lg bg-background border border-border font-mono text-xs font-bold tracking-widest text-primary select-all">
                        {mfaSecretData.secret}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(mfaSecretData.secret, "mfa_secret")}
                        className="text-xs gap-1"
                      >
                        {copiedField === "mfa_secret" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copiedField === "mfa_secret" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-border">
                    <h4 className="text-xs font-bold text-foreground">Step 2: Enter 6-Digit Code</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Enter the 6-digit code shown in your authenticator app to verify setup:
                    </p>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="123456"
                        value={mfaVerifyCode}
                        onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, ""))}
                        className="w-36 px-3 py-2 text-center text-sm font-mono tracking-widest rounded-lg border border-border bg-background text-foreground"
                      />
                      <Button
                        type="button"
                        disabled={isEnablingMfa || mfaVerifyCode.length !== 6}
                        className="text-xs gap-2"
                        onClick={async () => {
                          setMfaErrorMsg(null);
                          try {
                            await enableMfa({ secret: mfaSecretData.secret, code: mfaVerifyCode }).unwrap();
                            setMfaSuccessMsg("Two-Factor Authentication is now enabled on your account!");
                            setMfaSecretData(null);
                            setMfaVerifyCode("");
                            refetch();
                          } catch (err: any) {
                            setMfaErrorMsg(err?.data?.message || "Invalid code. Please try again.");
                          }
                        }}
                      >
                        {isEnablingMfa ? "Verifying..." : "Verify & Enable 2FA"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => {
                          setMfaSecretData(null);
                          setMfaVerifyCode("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  );
}
