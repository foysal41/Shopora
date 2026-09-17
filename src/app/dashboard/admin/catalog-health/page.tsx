"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, FolderOpen, Loader2, Package, Tags } from "lucide-react";
import { getAdminProducts, type AdminProduct } from "@/lib/api/adminProducts";

type Category = {
  id: string;
  name: string;
  status?: string | null;
  _count?: { products?: number };
  products?: number;
  productCount?: number;
};

const AdminCatalogHealthPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const loadCatalog = async () => {
      if (!apiUrl) {
        setError("NEXT_PUBLIC_API_URL is not configured");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [productData, categoryResponse] = await Promise.all([
          getAdminProducts(),
          fetch(`${apiUrl}/api/v1/categories`, { credentials: "include", cache: "no-store" }),
        ]);
        const categoryResult = await categoryResponse.json();
        if (!categoryResponse.ok || !categoryResult.success) {
          throw new Error(categoryResult.message || "Unable to load categories");
        }
        setProducts(productData);
        setCategories(categoryResult.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load catalog health");
      } finally {
        setLoading(false);
      }
    };

    void loadCatalog();
  }, [apiUrl]);

  const categoryRows = useMemo(() => {
    const productCounts = new Map<string, number>();
    products.forEach((product) => {
      if (product.category) {
        const key = product.category.trim().toLowerCase();
        productCounts.set(key, (productCounts.get(key) || 0) + 1);
      }
    });

    return categories.map((category) => ({
      ...category,
      count: category._count?.products ?? category.products ?? category.productCount ?? productCounts.get(category.name.toLowerCase()) ?? 0,
    }));
  }, [categories, products]);

  const uncategorized = products.filter((product) => !product.category).length;
  const lowStock = products.filter((product) => product.stockQuantity <= 5).length;
  const inactiveCategories = categories.filter((category) => (category.status || "ACTIVE").toUpperCase() === "INACTIVE").length;
  const emptyCategories = categoryRows.filter((category) => category.count === 0).length;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 font-['Poppins'] sm:px-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6"><p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]"><Tags size={15} /> Store operations</p><h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">Catalog Health</h1><p className="mt-1 text-sm text-[#64748B]">Spot gaps that make products harder to discover or sell.</p></header>
        {error && <p className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[["Uncategorized products", uncategorized, "text-red-600 bg-red-50", AlertTriangle], ["Low-stock products", lowStock, "text-amber-600 bg-amber-50", Package], ["Empty categories", emptyCategories, "text-blue-600 bg-blue-50", FolderOpen], ["Inactive categories", inactiveCategories, "text-slate-600 bg-slate-100", Tags]].map(([label, value, tone, Icon]) => <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></div><div><p className="text-xs text-[#64748B]">{label}</p><p className="mt-0.5 text-xl font-semibold text-[#0F172A]">{value}</p></div></div>)}
        </section>
        <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white"><div className="flex items-center justify-between border-b border-[#EEF2F2] p-4"><div><h2 className="font-semibold text-[#1E293B]">Category coverage</h2><p className="mt-1 text-sm text-[#64748B]">Categories with no products may need a cleanup or merchandising decision.</p></div><Link href="/dashboard/admin/categories" className="hidden items-center gap-1.5 text-sm font-medium text-[#0F766E] hover:underline sm:flex">Manage categories <ArrowRight size={15} /></Link></div><div className="overflow-x-auto"><table className="w-full min-w-155 text-left"><thead className="bg-[#FCFDFD] text-xs font-semibold uppercase tracking-wide text-[#64748B]"><tr><th className="px-5 py-3">Category</th><th className="px-5 py-3">Products</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Recommendation</th></tr></thead><tbody className="divide-y divide-[#EEF2F2]">{loading ? <tr><td colSpan={4} className="py-16 text-center text-sm text-[#64748B]"><Loader2 size={20} className="mx-auto mb-2 animate-spin text-[#0F766E]" />Analyzing catalog...</td></tr> : categoryRows.length === 0 ? <tr><td colSpan={4} className="py-16 text-center text-sm text-[#64748B]">No categories found.</td></tr> : categoryRows.map((category) => { const inactive = (category.status || "ACTIVE").toUpperCase() === "INACTIVE"; return <tr key={category.id}><td className="px-5 py-4 font-medium text-[#1E293B]">{category.name}</td><td className="px-5 py-4 text-sm text-[#475569]">{category.count}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${inactive ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{inactive ? "Inactive" : "Active"}</span></td><td className="px-5 py-4 text-sm text-[#64748B]">{category.count === 0 ? "Add products or archive category" : inactive ? "Review visibility" : "Healthy coverage"}</td></tr>; })}</tbody></table></div></section>
      </div>
    </main>
  );
};

export default AdminCatalogHealthPage;
