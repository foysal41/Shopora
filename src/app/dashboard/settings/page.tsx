"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  BadgeCheck,
  CalendarDays,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";



const inputClass =
  "w-full rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 font-['Poppins'] text-[14px] text-[#334155] outline-none transition focus:border-[#0F766E] placeholder:text-[#94A3B8]";
const labelClass =
  "mb-1.5 block font-['Poppins'] text-[13px] font-medium text-[#475569]";

/* A single password input with a show/hide toggle. */
type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete?: string;
};

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
}: PasswordFieldProps) => (
  <div>
    <label className={labelClass} htmlFor={id}>
      {label}
    </label>
    <div className="relative">
      <Lock
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
      />
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClass} pl-9 pr-10`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const AccountSettingsPage = () => {
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user;

  // `role` is an additional field; the exported hook isn't typed for it.
  const role = (user as { role?: string } | undefined)?.role || "Customer";

  /* ================= PROFILE ================= */

  const [name, setName] = useState<string | undefined>();
  const [savingProfile, setSavingProfile] = useState(false);

  // Use the session name until the user edits the field.
  const nameValue = name ?? user?.name ?? "";

  const nameChanged = user ? nameValue.trim() !== (user.name ?? "") : false;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = nameValue.trim();
    if (!trimmed) {
      toast.error("Name can't be empty");
      return;
    }
    if (!nameChanged) return;

    try {
      setSavingProfile(true);
      const { error } = await authClient.updateUser({ name: trimmed });

      if (error) {
        toast.error(error.message || "Couldn't update your profile");
        return;
      }

      toast.success("Profile updated");
      await refetch();
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      toast.error("Something went wrong");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= PASSWORD ================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [revokeOthers, setRevokeOthers] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordFilled =
    Boolean(currentPassword) && Boolean(newPassword) && Boolean(confirmPassword);

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setRevokeOthers(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordFilled) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from the current one");
      return;
    }

    try {
      setSavingPassword(true);
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthers,
      });

      if (error) {
        toast.error(error.message || "Couldn't change your password");
        return;
      }

      toast.success("Password changed successfully");
      resetPasswordForm();
    } catch (err) {
      console.error("CHANGE PASSWORD ERROR:", err);
      toast.error("Something went wrong");
    } finally {
      setSavingPassword(false);
    }
  };

  /* ================= DERIVED ================= */

  const displayName = user?.name || "";
  const initials =
    displayName
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  /* ================= LOADING / SIGNED OUT ================= */

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] font-['Poppins']">
        <div className="flex items-center gap-3 text-[14px] text-[#475569]">
          <Loader2 size={20} className="animate-spin text-[#0F766E]" />
          Loading your account...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-['Poppins']">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white px-8 py-12 text-center">
          <ShieldCheck size={32} className="text-[#94A3B8]" />
          <p className="text-[14px] text-[#64748B]">
            Please log in to manage your account settings.
          </p>
        </div>
      </main>
    );
  }

  /* ================= RENDER ================= */

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-3 py-4 font-['Poppins'] sm:px-5 md:px-6 lg:px-7 xl:px-8">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-['Poppins'] text-[20px] font-semibold text-[#0F172A]">
          Account Settings
        </h1>
        <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
          Manage your personal information and password.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* ============ PERSONAL INFORMATION ============ */}
        <section className="rounded-xl border border-[#E8EEEE] bg-white">

          <div className="flex items-center gap-2 border-b border-[#E8EEEE] px-5 py-4">
            <User size={18} className="text-[#0F766E]" />
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              Personal Information
            </h2>
          </div>

          <div className="p-5">

            {/* Avatar + identity */}
            <div className="mb-5 flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#0F766E] bg-[#E8F5F3]">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    height={512}
                    width={512}
                  />
                ) : (
                  <span className="text-[18px] font-semibold text-[#0F766E]">
                    {initials}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold text-[#1E293B]">
                  {displayName}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#E8F5F3] px-2 py-0.5 text-[12px] font-medium text-[#0F766E]">
                  <BadgeCheck size={13} />
                  Verified {role}
                </span>
              </div>

            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">

              {/* Full name (editable) */}
              <div>
                <label className={labelClass} htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={nameValue}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className={labelClass} htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    readOnly
                    disabled
                    className={`${inputClass} cursor-not-allowed bg-[#F8FAFC] pl-9 text-[#64748B]`}
                  />
                </div>
                <p className="mt-1 text-[12px] text-[#94A3B8]">
                  {user.emailVerified
                    ? "Your email is verified and can't be changed here."
                    : "Email address can't be changed here."}
                </p>
              </div>

              {/* Member since (read-only) */}
              {user.role=== "Customer"|| user.role=== "Seller" && memberSince && (
                <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2.5 text-[13px] text-[#64748B]">
                  <CalendarDays size={15} className="text-[#94A3B8]" />
                  Member since {memberSince}
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile || !nameChanged || !nameValue.trim()}
                className="cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#0D5F58] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>

            </form>

          </div>

        </section>

        {/* ============ PASSWORD & SECURITY ============ */}
        <section className="rounded-xl border border-[#E8EEEE] bg-white">

          <div className="flex items-center gap-2 border-b border-[#E8EEEE] px-5 py-4">
            <ShieldCheck size={18} className="text-[#0F766E]" />
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              Password &amp; Security
            </h2>
          </div>

          <div className="p-5">

            <form onSubmit={handlePasswordChange} className="space-y-4">

              <PasswordField
                id="currentPassword"
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              <PasswordField
                id="newPassword"
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />

              {/* Revoke other sessions */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={revokeOthers}
                  onChange={(e) => setRevokeOthers(e.target.checked)}
                  className="h-4 w-4 rounded border-[#CBD5E1] accent-[#0F766E]"
                />
                <span className="text-[14px] text-[#475569]">
                  Log out of other devices
                </span>
              </label>

              <button
                type="submit"
                disabled={savingPassword || !passwordFilled}
                className="cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#0D5F58] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
              >
                {savingPassword ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Update Password
                  </>
                )}
              </button>

            </form>

          </div>

        </section>

      </div>

    </main>
  );
};

export default AccountSettingsPage;
