
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Star,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import DeletePaymentModal from "@/components/dashboard/customer/DeletePaymentModal";
import toast from "react-hot-toast";

type PaymentMethod = {
  id: string;
  label?: string | null;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  billingAddress: string;
  providerRef: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type PaymentMethodForm = {
  label: string;
  brand: "visa" | "mastercard" | "amex" | "discover";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  billingAddress: string;
  providerRef: string;
  isDefault: boolean;
};

const MAX_PAYMENT_METHODS = 3;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm: PaymentMethodForm = {
  label: "",
  brand: "visa",
  last4: "",
  expiryMonth: "",
  expiryYear: "",
  cardholderName: "",
  billingAddress: "",
  providerRef: "",
  isDefault: false,
};

const brandOptions = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "Amex" },
  { value: "discover", label: "Discover" },
] as const;

const normalizeBrand = (brand: string) => {
  const value = (brand || "").toLowerCase();

  if (value === "master-card" || value === "mastercard") return "mastercard";
  if (value === "visa") return "visa";
  if (value === "amex") return "amex";
  if (value === "discover") return "discover";
  return "visa";
};

const formatLast4 = (value: string) => value.replace(/\D/g, "").slice(0, 4);

const getCurrentSessionToken = async (): Promise<string> => {
  try {
    const response = (await authClient.getSession()) as {
      data?: {
        session?: { token?: string };
        token?: string;
        accessToken?: string;
        access_token?: string;
      };
    };
    const sessionData = response?.data;
    const token =
      sessionData?.session?.token ||
      sessionData?.token ||
      sessionData?.accessToken ||
      sessionData?.access_token;

    if (!token) {
      throw new Error("Session token not found. Please log in again.");
    }

    return String(token);
  } catch (error) {
    console.error("GET SESSION TOKEN ERROR:", error);
    throw new Error("Unable to get your session token");
  }
};

async function paymentRequest(
  path: string,
  options: RequestInit = {},
  onUnauthorized?: () => void
) {
  const token = await getCurrentSessionToken();
  const requestHeaders = new Headers(options.headers || {});

  if (!requestHeaders.has("Content-Type") && options.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}/api/v1/payment-methods${path}`, {
    ...options,
    headers: requestHeaders,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized?.();
    }

    throw new Error(result?.message || "Payment request failed");
  }

  return result;
}

const PaymentMethodsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState<PaymentMethodForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadMethods = useCallback(async () => {
    try {
      setLoading(true);
      const result = await paymentRequest("", {}, () => router.push("/auth/login"));
      setMethods(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      console.error("LOAD PAYMENT METHODS ERROR:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load payment methods"
      );
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadMethods();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [session?.user, loadMethods]);

  const openAdd = () => {
    if (methods.length >= MAX_PAYMENT_METHODS) {
      toast.error("You can save at most 3 payment methods.");
      return;
    }

    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (method: PaymentMethod) => {
    setEditing(method);
    setForm({
      label: method.label || "",
      brand: normalizeBrand(method.brand) as PaymentMethodForm["brand"],
      last4: method.last4,
      expiryMonth: String(method.expiryMonth),
      expiryYear: String(method.expiryYear),
      cardholderName: method.cardholderName,
      billingAddress: method.billingAddress,
      providerRef: method.providerRef,
      isDefault: method.isDefault,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "last4") {
      setForm((prev) => ({ ...prev, last4: formatLast4(value) }));
      return;
    }

    if (name === "expiryMonth") {
      setForm((prev) => ({
        ...prev,
        expiryMonth: value.replace(/\D/g, "").slice(0, 2),
      }));
      return;
    }

    if (name === "expiryYear") {
      setForm((prev) => ({
        ...prev,
        expiryYear: value.replace(/\D/g, "").slice(0, 4),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please log in first");
      return;
    }

    if (!form.cardholderName.trim()) {
      toast.error("Cardholder name is required");
      return;
    }

    if (!form.billingAddress.trim()) {
      toast.error("Billing address is required");
      return;
    }

    if (!form.providerRef.trim()) {
      toast.error("Provider reference is required");
      return;
    }

    if (!/^\d{4}$/.test(form.last4)) {
      toast.error("Last 4 digits must be exactly 4 numbers");
      return;
    }

    const expiryMonth = Number(form.expiryMonth);
    const expiryYear = Number(form.expiryYear);

    if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
      toast.error("Expiry month must be between 1 and 12");
      return;
    }

    const currentYear = new Date().getFullYear();
    if (
      !Number.isInteger(expiryYear) ||
      expiryYear < currentYear ||
      expiryYear > currentYear + 30
    ) {
      toast.error("Expiry year is invalid");
      return;
    }

    if (expiryYear === currentYear && expiryMonth < new Date().getMonth() + 1) {
      toast.error("This payment method has expired");
      return;
    }

    try {
      setSaving(true);

      if (editing) {
        await paymentRequest(`/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            label: form.label || undefined,
            billingAddress: form.billingAddress,
            isDefault: form.isDefault,
          }),
        });
      } else {
        if (methods.length >= MAX_PAYMENT_METHODS) {
          toast.error("You can save at most 3 payment methods.");
          return;
        }

        await paymentRequest("", {
          method: "POST",
          body: JSON.stringify({
            label: form.label || undefined,
            brand: form.brand,
            last4: form.last4,
            expiryMonth,
            expiryYear,
            cardholderName: form.cardholderName,
            billingAddress: form.billingAddress,
            providerRef: form.providerRef,
            isDefault: form.isDefault,
          }),
        });
      }

      toast.success(editing ? "Payment method updated" : "Payment method added");
      await loadMethods();
      closeModal();
    } catch (error) {
      console.error("PAYMENT SAVE ERROR:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await paymentRequest(`/${id}/default`, {
        method: "PATCH",
      });
      toast.success("Default payment method updated");
      await loadMethods();
    } catch (error) {
      console.error("SET DEFAULT ERROR:", error);
      toast.error(error instanceof Error ? error.message : "Failed to set as default");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await paymentRequest(`/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.success("Payment method deleted");
      setDeleteTarget(null);
      await loadMethods();
    } catch (error) {
      console.error("DELETE PAYMENT METHOD ERROR:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete payment method");
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 font-['Poppins'] text-[14px] text-[#334155] outline-none transition focus:border-[#0F766E] placeholder:text-[#94A3B8]";
  const labelClass =
    "mb-1 block font-['Poppins'] text-[13px] font-medium text-[#475569]";

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-3 py-4 sm:px-5 md:px-6 lg:px-7 xl:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Poppins'] text-[20px] font-semibold text-[#0F172A]">
            Payment Methods
          </h1>
          <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
            {methods.length} saved {methods.length === 1 ? "card" : "cards"}
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          disabled={methods.length >= MAX_PAYMENT_METHODS}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 font-['Poppins'] text-[14px] font-medium text-white transition hover:bg-[#0D5F58] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
        >
          <Plus size={16} />
          Add Card
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#E8EEEE] bg-white py-20">
          <CreditCard size={32} className="text-[#94A3B8]" />
          <p className="font-['Poppins'] text-[14px] text-[#64748B]">
            Loading your payment methods...
          </p>
        </div>
      ) : methods.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#E8EEEE] bg-white py-20">
          <CreditCard size={32} className="text-[#94A3B8]" />
          <p className="font-['Poppins'] text-[14px] text-[#64748B]">
            You have no saved payment methods yet.
          </p>
          <button
            type="button"
            onClick={openAdd}
            disabled={methods.length >= MAX_PAYMENT_METHODS}
            className="mt-1 flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 font-['Poppins'] text-[14px] font-medium text-white transition hover:bg-[#0D5F58] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
          >
            <Plus size={16} />
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {methods.map((method) => (
            <div
              key={method.id}
              className="relative rounded-2xl border border-[#E8EEEE] bg-linear-to-br from-[#0F172A] via-[#1E293B] to-[#0F766E] p-5 text-white shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-white/10 p-2">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-[12px] uppercase tracking-[0.12em] text-white/70">
                      {normalizeBrand(method.brand)}
                    </p>
                    <p className="font-['Poppins'] text-[13px] text-white/80">
                      {method.label || "Saved card"}
                    </p>
                  </div>
                </div>

                {method.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-1 font-['Poppins'] text-[11px] font-medium text-[#0F766E]">
                    <Star size={12} className="fill-current" />
                    Default
                  </span>
                )}
              </div>

              <div className="mb-4">
                <p className="font-['Poppins'] text-[11px] uppercase tracking-[0.12em] text-white/60">
                  Card Number
                </p>
                <p className="mt-1 font-['Poppins'] text-[18px] font-semibold tracking-[0.12em]">
                  **** {method.last4}
                </p>
              </div>

              <div className="mb-5 flex items-center justify-between gap-4 text-white/80">
                <div>
                  <p className="font-['Poppins'] text-[11px] uppercase tracking-[0.12em] text-white/60">
                    Cardholder
                  </p>
                  <p className="mt-1 font-['Poppins'] text-[13px] font-medium">
                    {method.cardholderName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-['Poppins'] text-[11px] uppercase tracking-[0.12em] text-white/60">
                    Expires
                  </p>
                  <p className="mt-1 font-['Poppins'] text-[13px] font-medium">
                    {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear}
                  </p>
                </div>
              </div>

              <p className="mb-4 font-['Poppins'] text-[12px] text-white/75">
                Billing: {method.billingAddress}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {!method.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(method.id)}
                    className="rounded-lg cursor-pointer border border-white/20 bg-white/10 px-3 py-2 font-['Poppins'] text-[12px] font-medium text-white transition hover:bg-white/15"
                  >
                    Make default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openEdit(method)}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 font-['Poppins'] text-[12px] font-medium text-white transition hover:bg-white/15"
                >
                  <Pencil size={12} />
                  Edit
                </button>

                <button
                  type="button"
                    onClick={() => setDeleteTarget(method)}
                  className="flex items-center cursor-pointer gap-1 rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 font-['Poppins'] text-[12px] font-medium text-white transition hover:bg-red-500/20"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-['Poppins'] cursor-pointer text-[20px] font-semibold text-[#0F172A]">
                  {editing ? "Edit Payment Method" : "Add New Payment Method"}
                </h2>
                <p className="mt-1 font-['Poppins'] text-[13px] text-[#64748B]">
                  Save only tokenized provider data and payment metadata.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Card label</label>
                    <input
                      name="label"
                      value={form.label}
                      onChange={handleChange}
                      placeholder="Personal card"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Brand</label>
                    <select
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {brandOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Last 4</label>
                    <input
                      name="last4"
                      value={form.last4}
                      onChange={handleChange}
                      placeholder="4242"
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Expiry month</label>
                    <input
                      name="expiryMonth"
                      value={form.expiryMonth}
                      onChange={handleChange}
                      placeholder="12"
                      className={inputClass}
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Expiry year</label>
                    <input
                      name="expiryYear"
                      value={form.expiryYear}
                      onChange={handleChange}
                      placeholder="2028"
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Cardholder name</label>
                    <input
                      name="cardholderName"
                      value={form.cardholderName}
                      onChange={handleChange}
                      placeholder="Kevin"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Provider reference</label>
                    <input
                      name="providerRef"
                      value={form.providerRef}
                      onChange={handleChange}
                      placeholder="pm_xxxxxxxxx"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Billing address</label>
                    <textarea
                      name="billingAddress"
                      value={form.billingAddress}
                      onChange={handleChange}
                      rows={3}
                      placeholder="123 Main Street, Dhaka"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {editing && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Card label</label>
                    <input
                      name="label"
                      value={form.label}
                      onChange={handleChange}
                      placeholder="Personal card"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Billing address</label>
                    <textarea
                      name="billingAddress"
                      value={form.billingAddress}
                      onChange={handleChange}
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 font-['Poppins'] text-[14px] text-[#475569]">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[#CBD5E1] text-[#0F766E] focus:ring-[#0F766E]"
                />
                Set as default payment method
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg cursor-pointer border border-[#E8EEEE] bg-white px-4 py-2.5 font-['Poppins'] text-[14px] font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 font-['Poppins'] text-[14px] font-medium text-white transition hover:bg-[#0D5F58] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ShieldCheck size={16} />
                  {saving
                    ? editing
                      ? "Saving..."
                      : "Adding..."
                    : editing
                      ? "Save Changes"
                      : "Add Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeletePaymentModal
        isOpen={Boolean(deleteTarget)}
        cardLabel={deleteTarget?.label || "Saved card"}
        last4={deleteTarget?.last4 || ""}
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </main>
  );
};

export default PaymentMethodsPage;