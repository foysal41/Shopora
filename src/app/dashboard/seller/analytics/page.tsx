"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  ShoppingCart,
  Truck,
  Wallet,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getSellerDashboardStats,
  type SellerDashboardStats,
} from "@/lib/api/sellerDashboard";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getInitialRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return { startDate: formatDate(start), endDate: formatDate(today) };
};

const statusIcons: Record<string, typeof Clock3> = {
  Pending: Clock3,
  Processing: Package,
  Shipped: Truck,
  Delivered: CheckCircle2,
};

const currency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SellerAnalyticsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const sellerId = session?.user?.id;
  const initialRange = getInitialRange();
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading || !sellerId) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        setStats(await getSellerDashboardStats(sellerId, startDate, endDate));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load store analytics.");
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, [endDate, sellerId, sessionLoading, startDate]);

  const resetRange = () => {
    const range = getInitialRange();
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  if (sessionLoading || loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] font-['Poppins'] text-sm text-[#64748B]">Loading store analytics...</main>;
  }

  if (!sellerId) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-5 font-['Poppins'] text-sm text-[#64748B]">Seller session required to view analytics.</main>;
  }

  if (error || !stats) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-5"><div className="text-center font-['Poppins']"><p className="text-sm text-red-500">{error || "No analytics data available."}</p><button type="button" onClick={resetRange} className="mt-4 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white">Reset date range</button></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 font-['Poppins'] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0F766E]"><BarChart3 size={15} /> Store performance</p><h1 className="mt-2 text-2xl font-semibold text-[#0F172A] sm:text-3xl">Store Analytics</h1><p className="mt-1 text-sm text-[#64748B]">Understand sales, orders, and the products driving your store.</p></div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E8EEEE] bg-white p-2 shadow-sm"><CalendarDays size={17} className="ml-2 text-[#64748B]" /><input aria-label="Analytics start date" type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-md border border-[#E2E8F0] px-2 py-1.5 text-xs text-[#475569] outline-none focus:border-[#0F766E]" /><span className="text-xs text-[#94A3B8]">to</span><input aria-label="Analytics end date" type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-md border border-[#E2E8F0] px-2 py-1.5 text-xs text-[#475569] outline-none focus:border-[#0F766E]" /><button type="button" onClick={resetRange} aria-label="Reset date range" className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F766E]"><RefreshCw size={15} /></button></div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
          ["Sales", currency(stats.totalSales), Wallet, "text-[#0F766E] bg-[#E8F5F3]"],
          ["Orders", stats.totalOrders.toLocaleString(), ShoppingCart, "text-[#2563EB] bg-[#EAF3FF]"],
          ["Products sold", stats.productsSold.toLocaleString(), Package, "text-[#8B5CF6] bg-[#F2ECFF]"],
          ["Catalog products", stats.totalProducts.toLocaleString(), BarChart3, "text-[#F97316] bg-[#FFF2E8]"],
        ].map(([label, value, Icon, tone]) => { const StatIcon = Icon as typeof BarChart3; return <div key={label as string} className="rounded-xl border border-[#E8EEEE] bg-white p-5 shadow-sm"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><StatIcon size={19} /></div><p className="mt-4 text-xs text-[#64748B]">{label as string}</p><p className="mt-1 text-2xl font-semibold text-[#1E293B]">{value as string}</p></div>; })}</section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-[#E8EEEE] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-[#1E293B]">Top selling products</h2><p className="mt-1 text-sm text-[#64748B]">Best performers in this period.</p></div><Link href="/dashboard/seller/products" className="text-sm font-semibold text-[#0F766E]">Manage products</Link></div><div className="mt-5 space-y-3">{stats.analytics.topSellingProducts.length ? stats.analytics.topSellingProducts.map((product, index) => <div key={product.id} className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] px-3 py-3"><span className="w-5 text-sm font-semibold text-[#94A3B8]">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#334155]">{product.name}</p><p className="mt-1 text-xs text-[#64748B]">{product.sold} sold</p></div><p className="text-sm font-semibold text-[#1E293B]">{currency(product.revenue)}</p></div>) : <p className="py-8 text-center text-sm text-[#94A3B8]">No product sales in this period.</p>}</div></div>
          <div className="rounded-xl border border-[#E8EEEE] bg-white p-5"><div><h2 className="text-lg font-semibold text-[#1E293B]">Orders by status</h2><p className="mt-1 text-sm text-[#64748B]">Fulfillment workload for this period.</p></div><div className="mt-5 space-y-4">{stats.analytics.ordersOverview.length ? stats.analytics.ordersOverview.map((item) => { const StatusIcon = statusIcons[item.name] || Package; return <div key={item.name}><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-medium text-[#475569]"><StatusIcon size={16} className="text-[#0F766E]" />{item.name}</span><span className="text-[#64748B]">{item.count} ({item.percentage}%)</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8EEEE]"><div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${Math.min(item.percentage, 100)}%` }} /></div></div>; }) : <p className="py-8 text-center text-sm text-[#94A3B8]">No orders in this period.</p>}</div></div>
        </section>
      </div>
    </main>
  );
}