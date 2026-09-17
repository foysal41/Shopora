"use client";

import { useEffect, useMemo, useState } from "react";
import { Clipboard, Loader2, RefreshCw, Search, Tag, Ticket } from "lucide-react";
import { getCoupons, type Coupon } from "@/lib/api/coupons";
import toast from "react-hot-toast";

const getStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    expiry.setHours(23, 59, 59, 999);
    return expiry >= new Date() ? "Active" : "Expired";
};

const getType = (discountType: Coupon["discountType"]) => {
    if (discountType === "PERCENTAGE") return "Percentage";
    if (discountType === "FIXED_PRODUCT") return "Fixed product";
    return "Fixed amount";
};

const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCoupons = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getCoupons();
            setCoupons(response.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // The loader synchronizes this page with the external coupon API.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadCoupons();
    }, []);

    const filteredCoupons = useMemo(() => {
        const query = search.trim().toLowerCase();
        return coupons.filter((coupon) => {
            const matchesSearch =
                !query || `${coupon.couponCode} ${coupon.description || ""}`.toLowerCase().includes(query);
            const matchesStatus = status === "ALL" || getStatus(coupon.expiryDate).toUpperCase() === status;
            return matchesSearch && matchesStatus;
        });
    }, [coupons, search, status]);

    const activeCount = coupons.filter((coupon) => getStatus(coupon.expiryDate) === "Active").length;
    const expiredCount = coupons.length - activeCount;

    const copyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success(`${code} copied`);
        } catch {
            toast.error("Unable to copy coupon code");
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 font-['Poppins'] sm:px-6 lg:px-7">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]">
                            <Ticket size={15} /> Promotion management
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">Coupons</h1>
                        <p className="mt-1 text-sm text-[#64748B]">
                            Monitor promotional codes and their storefront availability.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void loadCoupons()}
                        className="flex items-center gap-2 self-start rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F6FAF9]"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </header>

                <section className="mb-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#E8EEEE] bg-white p-4">
                        <Tag className="text-[#0F766E]" size={19} />
                        <p className="mt-3 text-xs text-[#64748B]">Total coupons</p>
                        <p className="text-xl font-semibold text-[#0F172A]">{loading ? "..." : coupons.length}</p>
                    </div>
                    <div className="rounded-xl border border-[#E8EEEE] bg-white p-4">
                        <Ticket className="text-emerald-600" size={19} />
                        <p className="mt-3 text-xs text-[#64748B]">Active</p>
                        <p className="text-xl font-semibold text-[#0F172A]">{loading ? "..." : activeCount}</p>
                    </div>
                    <div className="rounded-xl border border-[#E8EEEE] bg-white p-4">
                        <Ticket className="text-slate-500" size={19} />
                        <p className="mt-3 text-xs text-[#64748B]">Expired</p>
                        <p className="text-xl font-semibold text-[#0F172A]">{loading ? "..." : expiredCount}</p>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
                    <div className="flex flex-col gap-3 border-b border-[#EEF2F2] p-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search code or description"
                                className="w-full rounded-lg border border-[#E8EEEE] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F766E]"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm text-[#475569] outline-none"
                            aria-label="Filter coupons by status"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                        <span className="text-sm text-[#64748B]">{filteredCoupons.length} shown</span>
                    </div>

                    {error && (
                        <div className="m-4 flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <span>{error}</span>
                            <button type="button" onClick={() => void loadCoupons()} className="font-medium underline">
                                Retry
                            </button>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-190 text-left">
                            <thead className="bg-[#FCFDFD] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                                <tr>
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Description</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Value</th>
                                    <th className="px-5 py-3">Expires</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EEF2F2]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-sm text-[#64748B]">
                                            <Loader2 size={20} className="mx-auto mb-2 animate-spin text-[#0F766E]" />
                                            Loading coupons...
                                        </td>
                                    </tr>
                                ) : filteredCoupons.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-sm text-[#64748B]">
                                            No coupons match your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCoupons.map((coupon) => {
                                        const couponStatus = getStatus(coupon.expiryDate);
                                        return (
                                            <tr key={coupon.id} className="hover:bg-[#FCFDFD]">
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => void copyCode(coupon.couponCode)}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-[#0F766E] hover:underline"
                                                        title="Copy coupon code"
                                                    >
                                                        {coupon.couponCode}
                                                        <Clipboard size={14} />
                                                    </button>
                                                </td>
                                                <td className="max-w-xs px-5 py-4 text-sm text-[#64748B]">
                                                    <span className="block truncate">
                                                        {coupon.description || "No description"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-[#475569]">
                                                    {getType(coupon.discountType)}
                                                </td>
                                                <td className="px-5 py-4 text-sm font-medium text-[#1E293B]">
                                                    {coupon.discountType === "PERCENTAGE"
                                                        ? `${coupon.amount}%`
                                                        : coupon.amount.toFixed(2)}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-[#64748B]">
                                                    {new Date(coupon.expiryDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            couponStatus === "Active"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {couponStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminCouponsPage;