import { Package, UserRound } from "lucide-react";
import Link from "next/link";
import type { AdminCustomer } from "@/lib/api/adminCustomers";
import type { AdminProduct } from "@/lib/api/adminProducts";

type RecentDataProps = {
  products: AdminProduct[];
  customers: AdminCustomer[];
  loading: boolean;
};

const RecentOrderAndTopProductAndActivities = ({ products, customers, loading }: RecentDataProps) => {
  const recentProducts = [...products]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 5);
  const sellerProducts = Array.from(
    products.reduce((sellers, product) => {
      sellers.set(product.sellerName, (sellers.get(product.sellerName) || 0) + 1);
      return sellers;
    }, new Map<string, number>()),
  ).sort(([, firstCount], [, secondCount]) => secondCount - firstCount).slice(0, 5);
  const recentCustomers = [...customers]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
      <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white xl:col-span-5">
        <div className="flex items-center justify-between border-b border-[#E8EEEE] px-4 py-3">
          <h2 className="font-['Poppins'] text-[15px] font-semibold text-[#1E293B]">Recently Added Products</h2>
          <Link href="/dashboard/admin/products" className="cursor-pointer font-['Poppins'] text-[11px] font-medium text-[#0F766E]">View All</Link>
        </div>
        {loading ? <p className="py-12 text-center text-xs text-[#64748B]">Loading products...</p> : recentProducts.length === 0 ? <p className="py-12 text-center text-xs text-[#64748B]">No products available.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-125">
              <thead><tr className="border-b border-[#F1F5F9]"><th className="px-4 py-2 text-left text-[9px] font-medium text-[#64748B]">Product</th><th className="px-2 py-2 text-left text-[9px] font-medium text-[#64748B]">Seller</th><th className="px-2 py-2 text-left text-[9px] font-medium text-[#64748B]">Stock</th><th className="px-4 py-2 text-left text-[9px] font-medium text-[#64748B]">Added</th></tr></thead>
              <tbody>{recentProducts.map((product) => <tr key={product.id} className="border-b border-[#F8FAFC] last:border-0"><td className="max-w-45 truncate px-4 py-2.5 text-[10px] font-medium text-[#0F766E]">{product.name}</td><td className="max-w-32 truncate px-2 py-2.5 text-[10px] text-[#475569]">{product.sellerName}</td><td className="px-2 py-2.5 text-[10px] text-[#475569]">{product.stockQuantity}</td><td className="px-4 py-2.5 text-[9px] text-[#64748B]">{new Date(product.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[#E8EEEE] bg-white p-4 xl:col-span-3">
        <div className="flex items-center justify-between"><h2 className="font-['Poppins'] text-[15px] font-semibold text-[#1E293B]">Products by Seller</h2><Link href="/dashboard/admin/products" className="cursor-pointer font-['Poppins'] text-[11px] font-medium text-[#0F766E]">View All</Link></div>
        <div className="mt-3 space-y-3">{loading ? <p className="py-8 text-center text-xs text-[#64748B]">Loading sellers...</p> : sellerProducts.length === 0 ? <p className="py-8 text-center text-xs text-[#64748B]">No sellers available.</p> : sellerProducts.map(([seller, count], index) => <div key={seller} className="flex items-center gap-2"><span className="w-4 text-[9px] text-[#94A3B8]">{index + 1}.</span><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F8FAFC]"><Package size={13} className="text-[#475569]" /></div><div className="min-w-0 flex-1"><p className="truncate text-[9px] font-medium text-[#334155]">{seller}</p><span className="text-[8px] text-[#94A3B8]">{count} products</span></div></div>)}</div>
      </section>

      <section className="rounded-xl border border-[#E8EEEE] bg-white p-4 xl:col-span-4">
        <div className="flex items-center justify-between"><h2 className="font-['Poppins'] text-[15px] font-semibold text-[#1E293B]">Recently Registered Customers</h2><Link href="/dashboard/admin/customers" className="cursor-pointer font-['Poppins'] text-[11px] font-medium text-[#0F766E]">View All</Link></div>
        <div className="mt-3 space-y-3">{loading ? <p className="py-8 text-center text-xs text-[#64748B]">Loading customers...</p> : recentCustomers.length === 0 ? <p className="py-8 text-center text-xs text-[#64748B]">No customers available.</p> : recentCustomers.map((customer) => <div key={customer.id} className="flex items-center gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3]"><UserRound size={13} className="text-[#0F766E]" /></div><div className="min-w-0"><p className="truncate text-[10px] leading-4 text-[#475569]">{customer.name}</p><p className="truncate text-[8px] text-[#94A3B8]">{new Date(customer.createdAt).toLocaleDateString()} · {customer.isBlocked ? "Blocked" : "Active"}</p></div></div>)}</div>
      </section>
    </div>
  );
};

export default RecentOrderAndTopProductAndActivities;
