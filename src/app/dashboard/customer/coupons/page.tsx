"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Copy, Search, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { getCoupons, type Coupon } from "@/lib/api/coupons";



type StatusFilter = "All" | "Active" | "Expired";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await getCoupons();
        setCoupons(response.data ?? []);
      } catch (error) {
        console.error("GET COUPONS ERROR:", error);
        toast.error("Failed to load coupons");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  /* ================= HELPERS ================= */

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    expiry.setHours(23, 59, 59, 999);
    return expiry < new Date();
  };

  const typeLabel = (discountType: Coupon["discountType"]) => {
    switch (discountType) {
      case "PERCENTAGE":
        return "Percentage off";
      case "FIXED_PRODUCT":
        return "Off a product";
      case "FIXED_CART":
      default:
        return "Off your cart";
    }
  };

  const discountLabel = (coupon: Coupon) =>
    coupon.discountType === "PERCENTAGE"
      ? `${coupon.amount}%`
      : `$${coupon.amount.toFixed(2)}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleCopy = async (coupon: Coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.couponCode);
      setCopiedId(coupon.id);
      toast.success(`Copied "${coupon.couponCode}"`);
      setTimeout(() => setCopiedId((id) => (id === coupon.id ? null : id)), 2000);
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  /* ================= FILTER + SORT ================= */

  const visibleCoupons = useMemo(() => {
    const term = search.trim().toLowerCase();

    return coupons
      .filter((coupon) => {
        const expired = isExpired(coupon.expiryDate);

        const statusMatch =
          statusFilter === "All" ||
          (statusFilter === "Active" && !expired) ||
          (statusFilter === "Expired" && expired);

        const searchMatch =
          !term ||
          coupon.couponCode.toLowerCase().includes(term) ||
          (coupon.description || "").toLowerCase().includes(term);

        return statusMatch && searchMatch;
      })
      // Active first, then soonest to expire.
      .sort((a, b) => {
        const aExpired = isExpired(a.expiryDate) ? 1 : 0;
        const bExpired = isExpired(b.expiryDate) ? 1 : 0;
        if (aExpired !== bExpired) return aExpired - bExpired;
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
  }, [coupons, search, statusFilter]);

  const activeCount = useMemo(
    () => coupons.filter((c) => !isExpired(c.expiryDate)).length,
    [coupons]
  );

  /* ================= RENDER ================= */

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-3 py-4 font-['Poppins'] sm:px-5 md:px-6 lg:px-7 xl:px-8">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold leading-tight text-[#0F172A] sm:text-[24px]">
          My Coupons
        </h1>

        <p className="mt-1 text-[14px] text-[#64748B]">
          {loading
            ? "Loading your available coupons..."
            : activeCount > 0
            ? `You have ${activeCount} active coupon${
                activeCount === 1 ? "" : "s"
              } to use — copy a code and apply it at checkout.`
            : "Copy a code and apply it at checkout to save on your order."}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full sm:max-w-xs">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or description..."
            className="h-11 w-full rounded-lg border border-[#E8EEEE] bg-white pl-10 pr-4 text-[14px] text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["All", "Active", "Expired"] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-4 py-2 text-[14px] font-medium transition ${
                statusFilter === tab
                  ? "bg-[#0F766E] text-white"
                  : "border border-[#E8EEEE] bg-white text-[#475569] hover:border-[#0F766E] hover:text-[#0F766E]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <div className="flex items-center gap-3 text-[14px] text-[#475569]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0F766E] border-t-transparent" />
            Loading coupons...
          </div>
        </div>
      ) : visibleCoupons.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-[#E8EEEE] bg-white py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
            <Ticket size={24} className="text-[#94A3B8]" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#0F172A]">
            No coupons found
          </h3>
          <p className="mt-1 text-[14px] text-[#64748B]">
            {coupons.length === 0
              ? "There are no coupons available right now. Check back soon!"
              : "Try changing your search or filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {visibleCoupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate);
            const copied = copiedId === coupon.id;

            return (
              <div
                key={coupon.id}
                className={`flex flex-col rounded-xl border border-l-4 bg-white p-5 shadow-[0_3px_15px_rgba(15,118,110,0.04)] ${
                  expired
                    ? "border-[#E8EEEE] border-l-[#CBD5E1] opacity-75"
                    : "border-[#E8EEEE] border-l-[#0F766E]"
                }`}
              >

                {/* Discount + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-[26px] font-bold leading-none ${
                        expired ? "text-[#94A3B8]" : "text-[#0F766E]"
                      }`}
                    >
                      {discountLabel(coupon)}
                    </p>
                    <p className="mt-1.5 text-[13px] font-medium text-[#64748B]">
                      {typeLabel(coupon.discountType)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 rounded-md border px-3 py-1 text-[13px] font-medium ${
                      expired
                        ? "border-slate-200 bg-slate-50 text-slate-500"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {expired ? "Expired" : "Active"}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 min-h-10 text-[14px] leading-5 text-[#475569]">
                  {coupon.description || "No description provided."}
                </p>

                {/* Code + Copy */}
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={`flex-1 truncate rounded-lg border border-dashed px-3 py-2.5 text-[15px] font-bold tracking-wider ${
                      expired
                        ? "border-slate-300 bg-slate-50 text-slate-400"
                        : "border-[#0F766E]/40 bg-[#F0FAF9] text-[#0F766E]"
                    }`}
                  >
                    {coupon.couponCode}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(coupon)}
                    disabled={expired}
                    className={`flex cursor-pointer shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-[14px] font-semibold transition ${
                      expired
                        ? "cursor-not-allowed border border-slate-200 text-slate-400"
                        : copied
                        ? "bg-emerald-600 text-white"
                        : "bg-[#0F766E] text-white hover:bg-[#0B625B]"
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Expiry */}
                <div className="mt-3 flex items-center gap-1.5 text-[13px] text-[#64748B]">
                  <CalendarDays size={14} className="text-[#94A3B8]" />
                  {expired ? "Expired on" : "Expires"} {formatDate(coupon.expiryDate)}
                </div>

              </div>
            );
          })}

        </div>
      )}

    </main>
  );
};

export default CouponsPage;
