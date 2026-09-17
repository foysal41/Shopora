"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/app/lib/auth-client";
import HeaderStart from "@/components/dashboard/customer/HeaderStart";
import StateCardsComponent from "@/components/dashboard/customer/StateCardsComponent";
import OrderAndTracking from "@/components/dashboard/customer/OrderAndTracking";
import RecommendedAndAccountSummery from "@/components/dashboard/customer/RecommendedAndAccountSummery";

import { getMyOrders, type MyOrder } from "@/lib/api/checkout";
import { getWishlist } from "@/lib/api/wishlist";
import { getCoupons } from "@/lib/api/coupons";
import { getProducts } from "@/lib/api/getProducts";
import type { getProduct } from "@/type/dashboard/Seller";

/* =========================================================
   DASHBOARD STATS (computed from the customer's real data)
========================================================= */

export type CustomerStats = {
  totalOrders: number;
  activeOrders: number;
  recentOrdersCount: number; // placed in the last 30 days
  wishlistCount: number;
  couponsCount: number;
  loyaltyPoints: number;
  pointsToNextReward: number;
};

// Orders that are still "in progress" (not finished/cancelled).
const ACTIVE_STATUSES = [
  "PENDING",
  "PLACED",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
];

const emptyStats: CustomerStats = {
  totalOrders: 0,
  activeOrders: 0,
  recentOrdersCount: 0,
  wishlistCount: 0,
  couponsCount: 0,
  loyaltyPoints: 0,
  pointsToNextReward: 1000,
};

const CustomerDashboard = () => {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const sessionToken = session?.session?.token;

  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [products, setProducts] = useState<getProduct[]>([]);
  const [stats, setStats] = useState<CustomerStats>(emptyStats);
  const [dataLoading, setDataLoading] = useState(true);

  /* =========================================================
     LOAD EVERYTHING THE DASHBOARD NEEDS (in parallel)
  ========================================================= */

  useEffect(() => {
    if (!userId || !sessionToken) return;

    const load = async () => {
      setDataLoading(true);

      // allSettled -> one failing request never blanks the whole dashboard.
      const [ordersRes, wishlistRes, couponsRes, productsRes] =
        await Promise.allSettled([
          getMyOrders(userId, sessionToken),
          getWishlist(userId),
          getCoupons(),
          getProducts(),
        ]);

      const ordersData =
        ordersRes.status === "fulfilled" ? ordersRes.value : [];
      const wishlistData =
        wishlistRes.status === "fulfilled" ? wishlistRes.value : [];
      const couponsData =
        couponsRes.status === "fulfilled" ? couponsRes.value.data ?? [] : [];
      const productsData =
        productsRes.status === "fulfilled" ? productsRes.value : [];

      setOrders(ordersData);
      setProducts(productsData);

      // ---- compute stats from the real data ----
      const now = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

      const activeOrders = ordersData.filter((o) =>
        ACTIVE_STATUSES.includes(o.status)
      ).length;

      const recentOrdersCount = ordersData.filter(
        (o) => now - new Date(o.createdAt).getTime() <= THIRTY_DAYS
      ).length;

      // Loyalty points: 1 point per $1 spent across all orders.
      const totalSpent = ordersData.reduce(
        (sum, o) => sum + (o.total || 0),
        0
      );
      const loyaltyPoints = Math.round(totalSpent);
      const nextMilestone = (Math.floor(loyaltyPoints / 1000) + 1) * 1000;

      setStats({
        totalOrders: ordersData.length,
        activeOrders,
        recentOrdersCount,
        wishlistCount: wishlistData.length,
        couponsCount: couponsData.length,
        loyaltyPoints,
        pointsToNextReward: nextMilestone - loyaltyPoints,
      });

      setDataLoading(false);
    };

    load();
  }, [userId, sessionToken]);

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (isPending) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex items-center gap-3 font-['Poppins'] text-[14px] text-[#475569]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0F766E] border-t-transparent" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-3 py-4 sm:px-5 md:px-6 lg:px-7 xl:px-8">

      <HeaderStart></HeaderStart>
      <StateCardsComponent stats={stats} loading={dataLoading} />
      <OrderAndTracking orders={orders} loading={dataLoading} />
      <RecommendedAndAccountSummery products={products} loading={dataLoading} />

    </main>
  );
};

export default CustomerDashboard;
