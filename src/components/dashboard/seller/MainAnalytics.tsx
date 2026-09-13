"use client";

import {
  CheckCircle2,
  Clock3,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { getSellerDashboardStats } from "@/lib/api/sellerDashboard";
import { useSession } from "@/lib/auth-client";

/* =========================================================
   TYPES
========================================================= */

type TopSellingProduct = {
  id: string;
  name: string;
  sold: number;
  revenue: number;
  image: string | null;
};

type OrderOverview = {
  name: string;
  count: number;
  percentage: number;
};

type RecentOrder = {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
};

type AnalyticsData = {
  topSellingProducts: TopSellingProduct[];
  ordersOverview: OrderOverview[];
  recentOrders: RecentOrder[];
};

type MainAnalyticsProps = {
  startDate: string;
  endDate: string;
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const statusConfig: Record<
  string,
  {
    icon: React.ElementType;
    className: string;
  }
> = {
  Pending: {
    icon: Clock3,
    className: "bg-[#FFF2E8] text-[#F97316]",
  },

  Processing: {
    icon: Package,
    className: "bg-[#EAF3FF] text-[#3B82F6]",
  },

  Shipped: {
    icon: Truck,
    className: "bg-[#F2ECFF] text-[#8B5CF6]",
  },

  Delivered: {
    icon: CheckCircle2,
    className: "bg-[#E8F7F4] text-[#0F766E]",
  },

  Cancelled: {
    icon: XCircle,
    className: "bg-[#FFECEC] text-[#EF4444]",
  },
};

/* =========================================================
   STATUS BADGE
========================================================= */

const statusStyles: Record<string, string> = {
  Delivered: "bg-[#E8F7E8] text-[#65A30D]",
  Shipped: "bg-[#F2ECFF] text-[#7C3AED]",
  Processing: "bg-[#EAF3FF] text-[#2563EB]",
  Pending: "bg-[#FFF2E8] text-[#EA580C]",
  Cancelled: "bg-[#FFECEC] text-[#EF4444]",
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 font-['Poppins'] text-[14px] font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

/* =========================================================
   MAIN ANALYTICS
========================================================= */

const MainAnalytics = ({
  startDate,
  endDate,
}: MainAnalyticsProps) => {
  const { data: session } = useSession();

  const sellerId = session?.user?.id;

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================================================
     FETCH ANALYTICS
  ========================================================= */

  useEffect(() => {
    if (!sellerId) {
    return;
  }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching seller analytics...");
        console.log("Seller ID:", sellerId);
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);

        const response =
          await getSellerDashboardStats(
            sellerId,
            startDate,
            endDate
          );

        console.log(
          "Seller Dashboard API Response:",
          response
        );

        setAnalytics(response.analytics);
      } catch (error) {
        console.error(
          "Seller Analytics Fetch Error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [sellerId, startDate, endDate]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="mt-5 flex min-h-75 items-center justify-center rounded-xl border border-[#E8EEEE] bg-white">
        <p className="font-['Poppins'] text-[14px] text-[#64748B]">
          Loading analytics...
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="mt-5 flex min-h-75 items-center justify-center rounded-xl border border-[#E8EEEE] bg-white px-5">
        <p className="text-center font-['Poppins'] text-[14px] text-[#EF4444]">
          {error}
        </p>
      </div>
    );
  }

  /* =========================================================
     NO DATA
  ========================================================= */

  if (!analytics) {
    return (
      <div className="mt-5 flex min-h-75 items-center justify-center rounded-xl border border-[#E8EEEE] bg-white">
        <p className="font-['Poppins'] text-[14px] text-[#64748B]">
          No analytics data available.
        </p>
      </div>
    );
  }

  const {
    topSellingProducts,
    ordersOverview,
    recentOrders,
  } = analytics;

  const totalOrders = ordersOverview.reduce(
    (total, item) => total + item.count,
    0
  );

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">

      {/* ==================================================
          TOP SELLING PRODUCTS
      ================================================== */}

      <div className="rounded-xl border border-[#E8EEEE] bg-white p-5 xl:col-span-5">

        <div className="flex items-center justify-between">
          <h2 className="font-['Poppins'] text-[17px] font-semibold text-[#1E293B]">
            Top Selling Products
          </h2>

          <button
            type="button"
            className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]"
          >
            View All
          </button>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_55px_85px] border-b border-[#E8EEEE] pb-3">

          <span className="font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
            Product
          </span>

          <span className="text-right font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
            Sold
          </span>

          <span className="text-right font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
            Revenue
          </span>

        </div>

        <div>
          {topSellingProducts.length > 0 ? (
            topSellingProducts.map(
              (product, index) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[1fr_55px_85px] items-center border-b border-[#F1F5F9] py-3 last:border-0"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <span className="shrink-0 font-['Poppins'] text-[14px] text-[#64748B]">
                      {index + 1}.
                    </span>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E8EEEE] bg-white">

                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={512}
                          height={512}
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#F8FAFA] font-['Poppins'] text-[12px] text-[#94A3B8]">
                          N/A
                        </div>
                      )}

                    </div>

                    <span className="truncate font-['Poppins'] text-[14px] font-medium text-[#334155]">
                      {product.name}
                    </span>

                  </div>

                  <span className="text-right font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    {product.sold}
                  </span>

                  <span className="text-right font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    $
                    {Number(
                      product.revenue || 0
                    ).toFixed(2)}
                  </span>

                </div>
              )
            )
          ) : (
            <div className="py-8 text-center">
              <p className="font-['Poppins'] text-[14px] text-[#94A3B8]">
                No selling data available.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ==================================================
          ORDERS OVERVIEW
      ================================================== */}

      <div className="rounded-xl border border-[#E8EEEE] bg-white p-5 xl:col-span-3">

        <div className="flex items-center justify-between">

          <h2 className="font-['Poppins'] text-[17px] font-semibold text-[#1E293B]">
            Orders Overview
          </h2>

          <button
            type="button"
            className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]"
          >
            View All
          </button>

        </div>

        <div className="mt-4">

          {ordersOverview.map((status) => {

            const config =
              statusConfig[status.name] || {
                icon: Package,
                className:
                  "bg-gray-100 text-gray-600",
              };

            const Icon = config.icon;

            return (
              <div
                key={status.name}
                className="flex items-center justify-between border-b border-[#F1F5F9] py-3 last:border-0"
              >

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.className}`}
                  >
                    <Icon size={16} />
                  </div>

                  <span className="font-['Poppins'] text-[14px] font-medium text-[#475569]">
                    {status.name}
                  </span>

                </div>

                <div className="flex items-center gap-5">

                  <span className="font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    {status.count}
                  </span>

                  <span className="w-12 text-right font-['Poppins'] text-[14px] text-[#64748B]">
                    {status.percentage}%
                  </span>

                </div>

              </div>
            );
          })}

        </div>

        <div className="mt-5 flex justify-center">

          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[conic-gradient(#EF4444_0deg_9deg,#3B82F6_9deg_50deg,#8B5CF6_50deg_147deg,#0F766E_147deg_323deg,#EF4444_323deg_360deg)]">

            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">

              <span className="font-['Poppins'] text-xl font-bold text-[#1E293B]">
                {totalOrders}
              </span>

              <span className="font-['Poppins'] text-[14px] text-[#64748B]">
                Total Orders
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          RECENT ORDERS
      ================================================== */}

      <div className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white xl:col-span-4">

        <div className="flex items-center justify-between border-b border-[#E8EEEE] px-5 py-4">

          <h2 className="font-['Poppins'] text-[17px] font-semibold text-[#1E293B]">
            Recent Orders
          </h2>

          <button
            type="button"
            className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]"
          >
            View All
          </button>

        </div>

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-162.5">

            <thead>
              <tr className="border-b border-[#E8EEEE]">

                <th className="px-5 py-3 text-left font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
                  Order ID
                </th>

                <th className="px-3 py-3 text-left font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
                  Customer
                </th>

                <th className="px-3 py-3 text-left font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
                  Amount
                </th>

                <th className="px-3 py-3 text-left font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
                  Status
                </th>

                <th className="px-5 py-3 text-left font-['Poppins'] text-[14px] font-semibold text-[#64748B]">
                  Date
                </th>

              </tr>
            </thead>

            <tbody>

              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#F1F5F9] last:border-0"
                  >

                    <td className="px-5 py-4 font-['Poppins'] text-[14px] font-semibold text-[#0F766E]">
                      {order.id}
                    </td>

                    <td className="px-3 py-4 font-['Poppins'] text-[14px] text-[#475569]">
                      {order.customer}
                    </td>

                    <td className="px-3 py-4 font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                      $
                      {Number(
                        order.amount || 0
                      ).toFixed(2)}
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge
                        status={order.status}
                      />
                    </td>

                    <td className="px-5 py-4 font-['Poppins'] text-[14px] text-[#64748B]">
                      {new Date(
                        order.date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center font-['Poppins'] text-[14px] text-[#94A3B8]"
                  >
                    No recent orders found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default MainAnalytics;