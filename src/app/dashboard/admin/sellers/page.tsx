"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Ban, CheckCircle2, Package, Search, ShieldCheck, Store, Trash2, UserRound } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  deleteAdminCustomer,
  getAdminUsers,
  setCustomerBlocked,
  updateAdminUserRole,
  type AdminCustomer,
} from "@/lib/api/adminCustomers";
import { getAdminProducts } from "@/lib/api/adminProducts";

type SellerSummary = AdminCustomer & {
  productCount: number;
  inventoryValue: number;
};

const ManageSellersPage = () => {
  const { data: session, isPending } = useSession();
  const [sellers, setSellers] = useState<SellerSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadSellers = async () => {
    try {
      setLoading(true);
      setError("");
      const [users, products] = await Promise.all([getAdminUsers(), getAdminProducts()]);
      const productStats = new Map<string, { productCount: number; inventoryValue: number }>();

      products.forEach((product) => {
        const sellerKey = product.sellerId || product.sellerName;
        const current = productStats.get(sellerKey) || { productCount: 0, inventoryValue: 0 };
        const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;
        productStats.set(sellerKey, {
          productCount: current.productCount + 1,
          inventoryValue: current.inventoryValue + product.stockQuantity * price,
        });
      });

      setSellers(
        users
          .filter((user) => {
            const role = user.role.toLowerCase();
            return role === "seller" || role === "admin";
          })
          .map((seller) => {
            const stats = productStats.get(seller.id) || productStats.get(seller.name) || { productCount: 0, inventoryValue: 0 };
            return { ...seller, ...stats };
          }),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPending || !session?.user?.id) return;
    const timer = window.setTimeout(() => void loadSellers(), 0);
    return () => window.clearTimeout(timer);
  }, [isPending, session?.user?.id]);

  const filteredSellers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sellers.filter((seller) => !query || `${seller.name} ${seller.email}`.toLowerCase().includes(query));
  }, [search, sellers]);

  const toggleBlock = async (seller: SellerSummary) => {
    try {
      setActionId(seller.id);
      await setCustomerBlocked(seller.id, !seller.isBlocked);
      setSellers((current) => current.map((item) => item.id === seller.id ? { ...item, isBlocked: !item.isBlocked } : item));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update seller status");
    } finally {
      setActionId(null);
    }
  };

  const removeSeller = async (seller: SellerSummary) => {
    if (!window.confirm(`Delete ${seller.name}'s seller account? This cannot be undone.`)) return;
    try {
      setActionId(seller.id);
      await deleteAdminCustomer(seller.id);
      setSellers((current) => current.filter((item) => item.id !== seller.id));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete seller");
    } finally {
      setActionId(null);
    }
  };

  const changeRole = async (seller: SellerSummary) => {
    try {
      setActionId(seller.id);
      const updatedUser = await updateAdminUserRole(
        seller.id,
        seller.role.toLowerCase() === "admin" ? "demote" : "Admin",
      );
      setSellers((current) => current.map((item) => item.id === seller.id
        ? { ...item, role: updatedUser.role }
        : item));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to promote seller");
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 font-['Poppins'] sm:px-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]"><Store size={15} /> Seller administration</p>
            <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">Manage Sellers</h1>
            <p className="mt-1 text-sm text-[#64748B]">Review seller accounts, catalog activity, and access status.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#E8EEEE] bg-white px-3 py-2 sm:w-80"><Search size={16} className="text-[#94A3B8]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sellers" className="w-full text-sm outline-none" /></div>
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-[#E8EEEE] bg-white p-4"><p className="text-xs text-[#64748B]">Total sellers</p><p className="mt-1 text-2xl font-semibold text-[#0F172A]">{loading ? "..." : sellers.length}</p></div><div className="rounded-xl border border-[#E8EEEE] bg-white p-4"><p className="text-xs text-[#64748B]">Active sellers</p><p className="mt-1 text-2xl font-semibold text-emerald-600">{loading ? "..." : sellers.filter((seller) => !seller.isBlocked).length}</p></div><div className="rounded-xl border border-[#E8EEEE] bg-white p-4"><p className="text-xs text-[#64748B]">Blocked sellers</p><p className="mt-1 text-2xl font-semibold text-red-600">{loading ? "..." : sellers.filter((seller) => seller.isBlocked).length}</p></div></div>

        {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
          {loading ? <p className="py-16 text-center text-sm text-[#64748B]">Loading sellers...</p> : filteredSellers.length === 0 ? <p className="py-16 text-center text-sm text-[#64748B]">No sellers found.</p> : <div className="divide-y divide-[#EEF2F2]">{filteredSellers.map((seller) => <div key={seller.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8F5F3]">{seller.image ? <Image src={seller.image} alt={seller.name} width={44} height={44} className="h-full w-full object-cover" /> : <UserRound size={21} className="text-[#0F766E]" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#1E293B]">{seller.name}</p><p className="truncate text-xs text-[#64748B]">{seller.email}</p><p className="mt-1 text-xs text-[#94A3B8]">Joined {new Date(seller.createdAt).toLocaleDateString()}</p></div></div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end"><span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs text-[#475569]"><Package size={13} />{seller.productCount} products</span><span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs text-[#475569]">${seller.inventoryValue.toFixed(2)} inventory</span><span className="inline-flex items-center rounded-full bg-[#E8F5F3] px-3 py-1 text-xs font-medium text-[#0F766E]">{seller.role}</span><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${seller.isBlocked ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{seller.isBlocked ? <Ban size={13} /> : <CheckCircle2 size={13} />}{seller.isBlocked ? "Blocked" : "Active"}</span><button type="button" onClick={() => void toggleBlock(seller)} disabled={actionId === seller.id} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-medium text-[#475569] hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50">{seller.isBlocked ? <ShieldCheck size={14} /> : <Ban size={14} />}{seller.isBlocked ? "Unblock" : "Block"}</button><button type="button" onClick={() => void changeRole(seller)} disabled={actionId === seller.id} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#D7EDE9] px-3 py-2 text-xs font-medium text-[#0F766E] hover:bg-[#E8F5F3] disabled:cursor-not-allowed disabled:opacity-50"><ShieldCheck size={14} />{seller.role.toLowerCase() === "admin" ? "Demote" : "Make admin"}</button><button type="button" onClick={() => void removeSeller(seller)} disabled={actionId === seller.id} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={14} />Delete</button></div>
          </div>)}</div>}
        </section>
      </div>
    </main>
  );
};

export default ManageSellersPage;
