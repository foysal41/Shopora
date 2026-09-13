"use client";

import {
  Eye,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  getSellerDashboardStats,
  SellerDashboardStats,
} from "@/lib/api/sellerDashboard";

type SellerStatCardProps = {
  startDate: string;
  endDate: string;
};

const SellerStatCard = ({
  startDate,
  endDate,
}: SellerStatCardProps) => {
  const [dashboardStats, setDashboardStats] =
    useState<SellerDashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Seller ID
        const sellerId =
          "k5iblU2uXpHoW1UwgSix98cnkdEboJmv";

        const data =
          await getSellerDashboardStats(
            sellerId,
            startDate,
            endDate
          );

        console.log(
          "SELLER DASHBOARD DATA:",
          data
        );

        setDashboardStats(data);
      } catch (error) {
        console.error(
          "SELLER DASHBOARD ERROR:",
          error
        );

        setDashboardStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [startDate, endDate]);

  const stats = [
    {
      title: "Total Sales",
      value: loading
        ? "—"
        : dashboardStats
        ? `$${dashboardStats.totalSales.toLocaleString()}`
        : "—",
      growth: loading
        ? "—"
        : dashboardStats
        ? `${dashboardStats.growth.sales}%`
        : "—",
      icon: (
        <span className="text-2xl font-bold">
          $
        </span>
      ),
      iconBg: "bg-[#E8F7F4]",
      iconColor: "text-[#0F766E]",
      chartColor: "#0F766E",
    },

    {
      title: "Total Orders",
      value: loading
        ? "—"
        : dashboardStats
        ? dashboardStats.totalOrders.toLocaleString()
        : "—",
      growth: loading
        ? "—"
        : dashboardStats
        ? `${dashboardStats.growth.orders}%`
        : "—",
      icon: <ShoppingCart size={24} />,
      iconBg: "bg-[#E8F7F4]",
      iconColor: "text-[#0F766E]",
      chartColor: "#0F766E",
    },

    {
      title: "Products Sold",
      value: loading
        ? "—"
        : dashboardStats
        ? dashboardStats.productsSold.toLocaleString()
        : "—",
      growth: loading
        ? "—"
        : dashboardStats
        ? `${dashboardStats.growth.productsSold}%`
        : "—",
      icon: <Package size={24} />,
      iconBg: "bg-[#F2ECFF]",
      iconColor: "text-[#8B5CF6]",
      chartColor: "#8B5CF6",
    },

    {
      title: "Total Earnings",
      value: loading
        ? "—"
        : dashboardStats
        ? `$${dashboardStats.totalEarnings.toLocaleString()}`
        : "—",
      growth: loading
        ? "—"
        : dashboardStats
        ? `${dashboardStats.growth.earnings}%`
        : "—",
      icon: <Wallet size={24} />,
      iconBg: "bg-[#FFF2E8]",
      iconColor: "text-[#F97316]",
      chartColor: "#F97316",
    },

    {
      title: "Store Views",
      value: loading
        ? "—"
        : dashboardStats
        ? dashboardStats.storeViews.toLocaleString()
        : "—",
      growth: loading
        ? "—"
        : dashboardStats
        ? `${dashboardStats.storeViewsGrowth}%`
        : "—",
      icon: <Eye size={24} />,
      iconBg: "bg-[#EAF3FF]",
      iconColor: "text-[#3B82F6]",
      chartColor: "#3B82F6",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-[#E8EEEE] bg-white p-5 shadow-[0_2px_10px_rgba(15,118,110,0.04)]"
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.iconBg} ${stat.iconColor}`}
            >
              {stat.icon}
            </div>
          </div>

          <p className="mt-4 font-['Poppins'] text-[14px] font-medium text-[#64748B]">
            {stat.title}
          </p>

          <h2 className="mt-1 font-['Poppins'] text-2xl font-bold text-[#1E293B]">
            {stat.value}
          </h2>

          <div className="mt-1 flex items-center gap-1">
            <TrendingUp
              size={14}
              className="text-[#0F766E]"
            />

            <span className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]">
              {stat.growth}
            </span>

            <span className="font-['Poppins'] text-[14px] text-[#64748B]">
              vs previous period
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SellerStatCard;