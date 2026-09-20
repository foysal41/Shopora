"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Tag,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { getCoupons, type Coupon } from "@/lib/api/coupons";

type CouponStatus = "Active" | "Expired";
type CouponType = "Percentage" | "Fixed Amount" | "Fixed Product";

const statusStyles: Record<CouponStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Expired: "bg-slate-50 text-slate-600 border-slate-200",
};

const typeStyles: Record<CouponType, string> = {
  Percentage: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Fixed Amount": "bg-purple-50 text-purple-700 border-purple-200",
  "Fixed Product": "bg-blue-50 text-blue-700 border-blue-200",
};

const couponColors = [
  "border-emerald-300 bg-emerald-50 text-emerald-700",
  "border-purple-300 bg-purple-50 text-purple-700",
  "border-blue-300 bg-blue-50 text-blue-700",
  "border-orange-300 bg-orange-50 text-orange-700",
];

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // ================= FETCH COUPONS =================

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);

        const response = await getCoupons();

        setCoupons(response.data);
      } catch (error) {
        console.error("GET COUPONS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // ================= HELPERS =================

  const getCouponStatus = (expiryDate: string): CouponStatus => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(23, 59, 59, 999);

    return expiry >= today ? "Active" : "Expired";
  };

  const getCouponType = (
    discountType: Coupon["discountType"]
  ): CouponType => {
    switch (discountType) {
      case "PERCENTAGE":
        return "Percentage";

      case "FIXED_PRODUCT":
        return "Fixed Product";

      case "FIXED_CART":
      default:
        return "Fixed Amount";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ================= FILTER =================

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const couponStatus = getCouponStatus(coupon.expiryDate);
      const couponType = getCouponType(coupon.discountType);

      const searchMatch =
        coupon.couponCode
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (coupon.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const statusMatch =
        statusFilter === "All Status" ||
        couponStatus === statusFilter;

      const typeMatch =
        typeFilter === "All Types" ||
        couponType === typeFilter;

      return searchMatch && statusMatch && typeMatch;
    });
  }, [coupons, search, statusFilter, typeFilter]);

  // ================= PAGINATION =================

  const totalPages = Math.ceil(
    filteredCoupons.length / itemsPerPage
  );

  const paginatedCoupons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredCoupons.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredCoupons, currentPage]);

  // ================= STATISTICS =================

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) => getCouponStatus(coupon.expiryDate) === "Active"
  ).length;

  // ================= RENDER =================

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-5 font-sans text-[#172554] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">

        {/* ================= HEADER ================= */}

        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172554] md:text-3xl">
              Coupons
            </h1>

            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span>Home</span>

              <ChevronRight size={15} />

              <span>Coupons</span>

              <ChevronRight size={15} />

              <span className="font-medium text-[#172554]">
                All Coupons
              </span>
            </div>
          </div>

          <Link href="/dashboard/seller/coupons/add-coupon">
            <button
              type="button"
              className="flex cursor-pointer w-fit items-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B625B] hover:shadow-md"
            >
              <Plus size={18} />
              Create New Coupon
            </button>
          </Link>
        </div>

        {/* ================= STATISTICS ================= */}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Total Coupons */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Tag className="h-6 w-6 text-[#0F766E]" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Coupons
                </p>

                <h3 className="mt-1 text-2xl font-bold text-[#172554]">
                  {loading ? "..." : totalCoupons}
                </h3>

                <p className="mt-0.5 text-sm text-slate-500">
                  All coupons
                </p>
              </div>

            </div>
          </div>

          {/* Active Coupons */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <Ticket className="h-6 w-6 text-blue-500" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600">
                  Active Coupons
                </p>

                <h3 className="mt-1 text-2xl font-bold text-[#172554]">
                  {loading ? "..." : activeCoupons}
                </h3>

                <p className="mt-0.5 text-sm text-slate-500">
                  Currently active
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* ================= FILTER AREA ================= */}

        <div className="rounded-t-xl border border-slate-200 bg-white p-4">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}

            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search coupons by code or description..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              />

            </div>

            {/* Status */}

            <div className="relative w-full lg:w-44">

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none focus:border-[#0F766E]"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Expired</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

            </div>

            {/* Type */}

            <div className="relative w-full lg:w-48">

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none focus:border-[#0F766E]"
              >
                <option>All Types</option>
                <option>Percentage</option>
                <option>Fixed Amount</option>
                <option>Fixed Product</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

            </div>

          </div>

        </div>

        {/* ================= TABLE ================= */}

        <div className="overflow-x-auto rounded-b-xl border-x border-b border-slate-200 bg-white">

          <table className="w-full min-w-[900px] border-collapse">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                  Coupon
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                  Type
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                  Discount
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                  Created
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                  Expiry Date
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">

                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0F766E]" />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading coupons...
                      </p>

                    </div>
                  </td>
                </tr>

              ) : paginatedCoupons.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <Search
                        size={24}
                        className="text-slate-400"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-[#172554]">
                      No coupons found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filter options.
                    </p>

                  </td>
                </tr>

              ) : (

                paginatedCoupons.map((coupon, index) => {

                  const status = getCouponStatus(
                    coupon.expiryDate
                  );

                  const type = getCouponType(
                    coupon.discountType
                  );

                  const color =
                    couponColors[index % couponColors.length];

                  return (
                    <tr
                      key={coupon.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/60"
                    >

                      {/* Coupon */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`relative flex h-9 min-w-[90px] items-center justify-center rounded-md border border-dashed px-3 text-sm font-bold ${color}`}
                          >
                            {coupon.couponCode}
                          </div>

                          <p className="max-w-[280px] text-sm font-medium leading-5 text-slate-600">
                            {coupon.description || "No description"}
                          </p>

                        </div>

                      </td>

                      {/* Type */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-md border px-3 py-1.5 text-sm font-medium ${typeStyles[type]}`}
                        >
                          {type}
                        </span>

                      </td>

                      {/* Discount */}

                      <td className="px-5 py-4">

                        <div>

                          <p className="text-base font-bold text-[#172554]">

                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.amount}%`
                              : `$${coupon.amount.toFixed(2)}`}

                          </p>

                          <p className="text-sm font-medium text-slate-500">
                            OFF
                          </p>

                        </div>

                      </td>

                      {/* Created */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">

                          <CalendarDays
                            size={16}
                            className="text-slate-400"
                          />

                          {formatDate(coupon.createdAt)}

                        </div>

                      </td>

                      {/* Expiry */}

                      <td className="px-5 py-4">

                        <span className="text-sm font-medium text-slate-700">
                          {formatDate(coupon.expiryDate)}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-md border px-3 py-1.5 text-sm font-medium ${statusStyles[status]}`}
                        >
                          {status}
                        </span>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

          {/* ================= FOOTER ================= */}

          {!loading && filteredCoupons.length > 0 && (

            <div className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center">

              <p className="text-sm font-medium text-slate-600">

                Showing{" "}
                {(currentPage - 1) * itemsPerPage + 1}
                {" "}
                to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredCoupons.length
                )}
                {" "}
                of{" "}
                {filteredCoupons.length}
                {" "}
                coupons

              </p>

              <div className="flex items-center gap-2">

                {/* Previous */}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(prev - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Numbers */}

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (

                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                      currentPage === page
                        ? "bg-[#0F766E] text-white"
                        : "border border-slate-200 text-slate-600 hover:border-[#0F766E]"
                    }`}
                  >
                    {page}
                  </button>

                ))}

                {/* Next */}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>

              </div>

            </div>

          )}

        </div>

      </div>
    </div>
  );
};

export default Coupons;