"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Edit3,
  FolderOpen,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  status?: string | null;
  createdAt: string;
  _count?: { products?: number };
  products?: number;
  productCount?: number;
};

type CategoryForm = {
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const emptyForm: CategoryForm = {
  name: "",
  description: "",
  status: "ACTIVE",
};

const getProductCount = (category: Category) =>
  category._count?.products ?? category.products ?? category.productCount ?? 0;

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = async () => {
    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/v1/categories`, {
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load categories");
      }

      setCategories(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The loader updates state when the external category request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !query ||
        `${category.name} ${category.description || ""}`
          .toLowerCase()
          .includes(query);
      const normalizedStatus = (category.status || "ACTIVE").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter(
    (category) => (category.status || "ACTIVE").toUpperCase() === "ACTIVE",
  ).length;
  const emptyCount = categories.filter((category) => getProductCount(category) === 0).length;
  const productTotal = categories.reduce(
    (total, category) => total + getProductCount(category),
    0,
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || "",
      status: (category.status || "ACTIVE").toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError("");
  };

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();

    if (!name) {
      setFormError("Category name is required.");
      return;
    }
    if (name.length > 80) {
      setFormError("Category name must be 80 characters or fewer.");
      return;
    }
    if (!API_URL) {
      setFormError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      const isEditing = Boolean(editingCategory);
      const response = await fetch(
        `${API_URL}/api/v1/categories${isEditing ? `/${editingCategory?.id}` : ""}`,
        {
          method: isEditing ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: form.description.trim() || undefined,
            status: form.status,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Unable to ${isEditing ? "update" : "create"} category`);
      }

      toast.success(isEditing ? "Category updated" : "Category created");
      closeModal();
      await loadCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save category");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (getProductCount(category) > 0) {
      toast.error("Move or delete this category's products before deleting it.");
      return;
    }
    if (!window.confirm(`Delete the ${category.name} category?`)) return;
    if (!API_URL) return;

    try {
      setDeletingId(category.id);
      const response = await fetch(`${API_URL}/api/v1/categories/${category.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete category");
      }

      setCategories((current) => current.filter((item) => item.id !== category.id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 font-['Poppins'] sm:px-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]">
              <FolderOpen size={15} /> Catalog management
            </div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">Categories</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Keep the storefront taxonomy clear, useful, and easy to shop.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F6FAF9]"
              aria-label="Refresh categories"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0D5F58]"
            >
              <Plus size={17} /> Add category
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total categories", value: categories.length, icon: FolderOpen, tone: "text-[#0F766E] bg-[#E8F5F3]" },
            { label: "Active", value: activeCount, icon: Check, tone: "text-emerald-600 bg-emerald-50" },
            { label: "Products assigned", value: productTotal, icon: Package, tone: "text-blue-600 bg-blue-50" },
            { label: "Needs attention", value: emptyCount, icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={19} /></div>
              <div><p className="text-xs text-[#64748B]">{label}</p><p className="mt-0.5 text-xl font-semibold text-[#0F172A]">{value}</p></div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#EEF2F2] p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories" className="w-full rounded-lg border border-[#E8EEEE] py-2.5 pl-9 pr-3 text-sm text-[#334155] outline-none focus:border-[#0F766E]" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg cursor-pointer border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm text-[#475569] outline-none focus:border-[#0F766E]" aria-label="Filter categories by status">
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <p className="text-sm text-[#64748B] lg:ml-auto">{filteredCategories.length} of {categories.length} categories</p>
          </div>

          {error && <div className="m-4 flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"><span>{error}</span><button type="button" onClick={() => void loadCategories()} className="font-medium underline">Retry</button></div>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left">
              <thead className="bg-[#FCFDFD] text-xs font-semibold uppercase tracking-wide text-[#64748B]"><tr><th className="px-5 py-3">Category</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Products</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#EEF2F2]">
                {loading ? <tr><td colSpan={6} className="py-16 text-center text-sm text-[#64748B]"><Loader2 size={20} className="mx-auto mb-2 animate-spin text-[#0F766E]" />Loading categories...</td></tr> : filteredCategories.length === 0 ? <tr><td colSpan={6} className="py-16 text-center text-sm text-[#64748B]"><Tag size={25} className="mx-auto mb-2 text-[#94A3B8]" />No categories match your filters.</td></tr> : filteredCategories.map((category) => {
                  const productCount = getProductCount(category);
                  const isActive = (category.status || "ACTIVE").toUpperCase() === "ACTIVE";
                  return <tr key={category.id} className="hover:bg-[#FCFDFD]">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5F3] text-[#0F766E]"><Tag size={18} /></div><span className="font-medium text-[#1E293B]">{category.name}</span></div></td>
                    <td className="max-w-xs px-5 py-4 text-sm text-[#64748B]"><span className="block truncate">{category.description || "No description"}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-sm font-medium ${productCount === 0 ? "text-amber-600" : "text-[#475569]"}`}><Package size={15} />{productCount}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-5 py-4 text-sm text-[#64748B]">{new Date(category.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEditModal(category)} className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-md border border-[#E8EEEE] text-[#64748B] hover:border-[#0F766E] hover:text-[#0F766E]" aria-label={`Edit ${category.name}`}><Edit3 size={15} /></button><button type="button" onClick={() => void deleteCategory(category)} disabled={deletingId === category.id || productCount > 0} className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-md border border-red-100 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Delete ${category.name}`} title={productCount > 0 ? "Cannot delete a category with products" : "Delete category"}>{deletingId === category.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}</button></div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" role="dialog" aria-modal="true" aria-labelledby="category-dialog-title"><div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"><div className="mb-5 flex items-center justify-between"><div><h2 id="category-dialog-title" className="text-lg font-semibold text-[#0F172A]">{editingCategory ? "Edit category" : "Add category"}</h2><p className="mt-1 text-sm text-[#64748B]">Categories organize products across the storefront.</p></div><button type="button" onClick={closeModal} className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-md text-[#64748B] hover:bg-[#F8FAFC]" aria-label="Close dialog"><X size={18} /></button></div><form onSubmit={saveCategory} className="space-y-4"><div><label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-[#475569]">Name</label><input id="category-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength={80} autoFocus className="w-full text-black rounded-lg border border-[#E8EEEE] px-3 py-2.5 text-sm outline-none focus:border-[#0F766E]" placeholder="e.g. Electronics" /></div><div><label htmlFor="category-description" className="mb-1.5 block text-sm font-medium text-[#475569]">Description</label><textarea id="category-description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="w-full text-black resize-none rounded-lg border border-[#E8EEEE] px-3 py-2.5 text-sm outline-none focus:border-[#0F766E]" placeholder="Explain what belongs in this category" /></div><div><label htmlFor="category-status" className="mb-1.5 block text-sm font-medium text-[#475569]">Visibility</label><select id="category-status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as CategoryForm["status"] }))} className="w-full text-black cursor-pointer rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F766E]"><option value="ACTIVE">Active and visible</option><option value="INACTIVE">Inactive and hidden</option></select></div>{formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={closeModal} className="rounded-lg cursor-pointer border border-[#E8EEEE] px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]">Cancel</button><button type="submit" disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0D5F58] disabled:opacity-60">{saving && <Loader2 size={15} className="animate-spin" />}{saving ? "Saving..." : editingCategory ? "Save changes" : "Create category"}</button></div></form></div></div>}
    </main>
  );
};

export default AdminCategoriesPage;
