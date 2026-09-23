"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, Loader2, Package, Search, ShieldAlert, Trash2, type LucideIcon } from "lucide-react";
import { deleteAdminProduct, getAdminProducts, type AdminProduct } from "@/lib/api/adminProducts";
import DeleteProductModalAdmin from "@/components/dashboard/admin/DeleteProductModalAdmin";
import { toast } from "react-hot-toast";

const normalizeStatus = (status?: string | null) => (status || "ACTIVE").toUpperCase();

const AdminModerationPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteProduct, setDeleteProduct] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        setProducts(await getAdminProducts());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      setIsDeleting(true);
      await deleteAdminProduct(deleteProduct.id);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== deleteProduct.id));
      setDeleteProduct(null);
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesStatus = status === "ALL" || normalizeStatus(product.status) === status;
      const matchesSearch =
        !query ||
        `${product.name} ${product.sku || ""} ${product.sellerName} ${product.category || ""}`
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [products, search, status]);

  const pendingCount = products.filter((product) => normalizeStatus(product.status) === "PENDING").length;
  const inactiveCount = products.filter((product) => normalizeStatus(product.status) === "INACTIVE").length;
  const missingCategoryCount = products.filter((product) => !product.category).length;
  const moderationMetrics: Array<{
    label: string;
    value: number;
    tone: string;
    Icon: LucideIcon;
  }> = [
    { label: "Needs review", value: pendingCount, tone: "text-amber-600 bg-amber-50", Icon: ShieldAlert },
    { label: "Inactive listings", value: inactiveCount, tone: "text-slate-600 bg-slate-100", Icon: CheckCircle2 },
    { label: "Missing category", value: missingCategoryCount, tone: "text-red-600 bg-red-50", Icon: Package },
    { label: "Total listings", value: products.length, tone: "text-[#0F766E] bg-[#E8F5F3]", Icon: CheckCircle2 },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 font-['Poppins'] sm:px-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <DeleteProductModalAdmin
          isOpen={deleteProduct !== null}
          productName={deleteProduct?.name}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
        <header className="mb-6">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]"><ShieldAlert size={15} /> Admin controls</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">Product Moderation</h1>
          <p className="mt-1 text-sm text-[#64748B]">Review seller listings before they affect the storefront.</p>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {moderationMetrics.map(({ label, value, tone, Icon }) => (
            <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></div>
              <div><p className="text-xs text-[#64748B]">{label}</p><p className="mt-0.5 text-xl font-semibold text-[#0F172A]">{value}</p></div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#EEF2F2] p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 text-black lg:max-w-md"><Search size={16} className="absolute left-3  top-1/2 -translate-y-1/2 text-[#94A3B8]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, SKU, seller" className="w-full rounded-lg border border-[#E8EEEE] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0F766E]" /></div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg cursor-pointer border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm text-[#475569] outline-none" aria-label="Filter listings by status"><option value="ALL">All statuses</option><option value="PENDING">Pending review</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
          </div>
          {error && <p className="m-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left"><thead className="bg-[#FCFDFD] text-xs font-semibold uppercase tracking-wide text-[#64748B]"><tr><th className="px-5 py-3">Listing</th><th className="px-5 py-3">Seller</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#EEF2F2]">
              {loading ? <tr><td colSpan={5} className="py-16 text-center text-sm text-[#64748B]"><Loader2 size={20} className="mx-auto mb-2 animate-spin text-[#0F766E]" />Loading listings...</td></tr> : filteredProducts.length === 0 ? <tr><td colSpan={5} className="py-16 text-center text-sm text-[#64748B]">No listings match your filters.</td></tr> : filteredProducts.map((product) => <tr key={product.id} className="hover:bg-[#FCFDFD]"><td className="px-5 py-4"><p className="font-medium text-[#1E293B]">{product.name}</p><p className="mt-1 text-xs text-[#94A3B8]">SKU: {product.sku || "Not provided"}</p></td><td className="px-5 py-4 text-sm text-[#475569]">{product.sellerName}</td><td className="px-5 py-4 text-sm text-[#64748B]">{product.category || <span className="text-red-500">Uncategorized</span>}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${normalizeStatus(product.status) === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : normalizeStatus(product.status) === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{normalizeStatus(product.status)}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-4"><Link href={`/products/${product.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F766E] hover:underline"><Eye size={15} /> View</Link><button type="button" onClick={() => setDeleteProduct(product)} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700" aria-label={`Delete ${product.name}`}><Trash2 size={15} /> Delete</button></div></td></tr>)}
            </tbody></table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminModerationPage;
