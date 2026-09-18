"use client";

import React, { useCallback, useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/admin/DashboardHeader";
import StatCards from "@/components/dashboard/admin/StatCards";
import SalesOrderLowstockStatus from "@/components/dashboard/admin/SalesOrderLowstockStatus";
import RecentOrderAndTopProductAndActivities from "@/components/dashboard/admin/RecentOrderAndTopProductAndActivities";
import QuickAction from "@/components/dashboard/admin/QuickAction";
import { getAdminCustomers, type AdminCustomer } from "@/lib/api/adminCustomers";
import { getAdminProducts, type AdminProduct } from "@/lib/api/adminProducts";

export type AdminDashboardData = {
  products: AdminProduct[];
  customers: AdminCustomer[];
};

const AdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData>({ products: [], customers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [products, customers] = await Promise.all([
        getAdminProducts(),
        getAdminCustomers(),
      ]);
      setData({ products, customers });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  return (
    <section className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6 lg:px-7">

      <div className="mx-auto max-w-[1600px]">

        <DashboardHeader onRefresh={() => void loadDashboard()} loading={loading} />
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 font-['Poppins'] text-sm text-red-600">
            <span>{error}</span>
            <button type="button" onClick={() => void loadDashboard()} className="cursor-pointer font-medium underline">
              Retry
            </button>
          </div>
        )}
        <StatCards products={data.products} customers={data.customers} loading={loading} />
        <SalesOrderLowstockStatus products={data.products} loading={loading} />
        <RecentOrderAndTopProductAndActivities products={data.products} customers={data.customers} loading={loading} />
        <QuickAction></QuickAction>

      </div>
    </section>
  );
};

export default AdminDashboard;