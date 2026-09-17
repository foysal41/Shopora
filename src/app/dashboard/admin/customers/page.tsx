"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Ban, CheckCircle2, Search, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  deleteAdminCustomer,
  getAdminCustomers,
  setCustomerBlocked,
  type AdminCustomer,
} from "@/lib/api/adminCustomers";

const CustomersPage = () => {
  const { data: session, isPending } = useSession();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      setCustomers(await getAdminCustomers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPending || !session?.user?.id) return;

    const timer = window.setTimeout(() => {
      void loadCustomers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isPending, session?.user?.id]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.email}`.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const toggleBlock = async (customer: AdminCustomer) => {
    try {
      setActionId(customer.id);
      await setCustomerBlocked(customer.id, !customer.isBlocked);
      setCustomers((current) => current.map((item) => item.id === customer.id ? { ...item, isBlocked: !item.isBlocked } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update customer status");
    } finally {
      setActionId(null);
    }
  };

  const removeCustomer = async (customer: AdminCustomer) => {
    if (!window.confirm(`Delete ${customer.name}'s account? This cannot be undone.`)) return;
    try {
      setActionId(customer.id);
      await deleteAdminCustomer(customer.id);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete customer");
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-2xl font-semibold text-[#0F172A]">Customers</h1>
            <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">Manage customer accounts, access, and activity.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#E8EEEE] bg-white px-3 py-2 sm:w-80">
            <Search size={16} className="text-[#94A3B8]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" className="w-full font-['Poppins'] text-sm outline-none" />
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 font-['Poppins'] text-sm text-red-600">{error}</p>}
        <div className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
          {loading ? <p className="py-16 text-center font-['Poppins'] text-sm text-[#64748B]">Loading customers...</p> : filteredCustomers.length === 0 ? <p className="py-16 text-center font-['Poppins'] text-sm text-[#64748B]">No customers found.</p> : <div className="divide-y divide-[#EEF2F2]">
            {filteredCustomers.map((customer) => <div key={customer.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E8F5F3]">
                  {customer.image ? <Image src={customer.image} alt={customer.name} width={44} height={44} className="h-full w-full object-cover" /> : <UserRound size={21} className="text-[#0F766E]" />}
                </div>
                <div className="min-w-0"><p className="truncate font-['Poppins'] text-sm font-semibold text-[#1E293B]">{customer.name}</p><p className="truncate font-['Poppins'] text-xs text-[#64748B]">{customer.email}</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-['Poppins'] text-xs font-medium ${customer.isBlocked ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{customer.isBlocked ? <Ban size={13} /> : <CheckCircle2 size={13} />}{customer.isBlocked ? "Blocked" : "Active"}</span>
                <button type="button" onClick={() => toggleBlock(customer)} disabled={actionId === customer.id} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 py-2 font-['Poppins'] text-xs font-medium text-[#475569] hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-50">{customer.isBlocked ? <ShieldCheck size={14} /> : <Ban size={14} />}{customer.isBlocked ? "Unblock" : "Block"}</button>
                <button type="button" onClick={() => removeCustomer(customer)} disabled={actionId === customer.id} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-100 px-3 py-2 font-['Poppins'] text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={14} />Delete</button>
              </div>
            </div>)}
          </div>}
        </div>
      </div>
    </main>
  );
};

export default CustomersPage;