"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Download,
    FileBarChart,
    Loader2,
    Package,
    RefreshCw,
    Store,
    Tags,
    type LucideIcon,
} from "lucide-react";
import { getAdminProducts, type AdminProduct } from "@/lib/api/adminProducts";

type Category = {
    id: string;
    name: string;
    _count?: { products?: number };
    products?: number;
    productCount?: number;
};

const AdminReportsPage = () => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const loadReportData = async () => {
        if (!apiUrl) {
            setError("NEXT_PUBLIC_API_URL is not configured");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError("");
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
            setError(err instanceof Error ? err.message : "Unable to load report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // The loader synchronizes this page with external report data.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadReportData();
        // The API URL is fixed for the lifetime of this dashboard page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiUrl]);

    const sellerRows = useMemo(() => {
        const rows = new Map<string, { seller: string; products: number; stock: number; value: number }>();
        products.forEach((product) => {
            const row = rows.get(product.sellerName) || {
                seller: product.sellerName,
                products: 0,
                stock: 0,
                value: 0,
            };
            row.products += 1;
            row.stock += product.stockQuantity;
            row.value += product.stockQuantity * (product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice);
            rows.set(product.sellerName, row);
        });
        return Array.from(rows.values()).sort((a, b) => b.value - a.value);
    }, [products]);

    const categoryRows = useMemo(
        () =>
            categories
                .map((category) => ({
                    name: category.name,
                    products: category._count?.products ?? category.products ?? category.productCount ?? 0,
                }))
                .sort((a, b) => b.products - a.products),
        [categories]
    );

    const inventoryValue = products.reduce(
        (total, product) =>
            total + product.stockQuantity * (product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice),
        0
    );

    const lowStock = products.filter((product) => product.stockQuantity <= 5).length;

    const reportMetrics: Array<{
        label: string;
        value: string | number;
        tone: string;
        Icon: LucideIcon;
    }> = [
            {
                label: "Inventory value",
                value: `$${inventoryValue.toFixed(2)}`,
                tone: "text-[#0F766E] bg-[#E8F5F3]",
                Icon: Package,
            },
            {
                label: "Active listings",
                value: products.filter((product) => (product.status || "ACTIVE").toUpperCase() === "ACTIVE").length,
                tone: "text-emerald-600 bg-emerald-50",
                Icon: FileBarChart,
            },
            {
                label: "Low stock",
                value: lowStock,
                tone: "text-amber-600 bg-amber-50",
                Icon: Package,
            },
            {
                label: "Sellers represented",
                value: sellerRows.length,
                tone: "text-blue-600 bg-blue-50",
                Icon: Store,
            },
        ];

    const exportReport = () => {
        const rows = [
            ["Seller", "Products", "Units in stock", "Inventory value"],
            ...sellerRows.map((row) => [row.seller, row.products, row.stock, row.value.toFixed(2)]),
        ];
        const csv = rows
            .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "shopora-seller-inventory-report.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 font-['Poppins'] sm:px-6 lg:px-7">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]">
                            <FileBarChart size={15} /> Business intelligence
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">Reports</h1>
                        <p className="mt-1 text-sm text-[#64748B]">
                            Operational visibility across sellers, products, and inventory.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => void loadReportData()}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm font-medium text-[#475569]"
                        >
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button
                            type="button"
                            onClick={exportReport}
                            disabled={loading || sellerRows.length === 0}
                            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#0F766E] px-3 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </header>

                {error && (
                    <p className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {reportMetrics.map(({ label, value, tone, Icon }) => (
                        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-[#64748B]">{label}</p>
                                <p className="mt-0.5 text-xl font-semibold text-[#0F172A]">{loading ? "..." : value}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="grid gap-5 lg:grid-cols-2">
                    <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
                        <div className="flex items-center gap-2 border-b border-[#EEF2F2] p-4">
                            <Store size={18} className="text-[#0F766E]" />
                            <h2 className="font-semibold text-[#1E293B]">Seller inventory value</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-125 text-left">
                                <thead className="bg-[#FCFDFD] text-xs uppercase tracking-wide text-[#64748B]">
                                    <tr>
                                        <th className="px-4 py-3">Seller</th>
                                        <th className="px-4 py-3">Products</th>
                                        <th className="px-4 py-3 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEF2F2]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center">
                                                <Loader2 className="mx-auto animate-spin text-[#0F766E]" size={20} />
                                            </td>
                                        </tr>
                                    ) : (
                                        sellerRows.map((row) => (
                                            <tr key={row.seller}>
                                                <td className="px-4 py-3 text-sm font-medium text-[#1E293B]">{row.seller}</td>
                                                <td className="px-4 py-3 text-sm text-[#64748B]">{row.products}</td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-[#0F766E]">
                                                    ${row.value.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
                        <div className="flex items-center gap-2 border-b border-[#EEF2F2] p-4">
                            <Tags size={18} className="text-[#0F766E]" />
                            <h2 className="font-semibold text-[#1E293B]">Category coverage</h2>
                        </div>
                        <div className="divide-y divide-[#EEF2F2]">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="mx-auto animate-spin text-[#0F766E]" size={20} />
                                </div>
                            ) : (
                                categoryRows.map((row) => (
                                    <div key={row.name} className="flex items-center justify-between px-4 py-3">
                                        <span className="text-sm font-medium text-[#1E293B]">{row.name}</span>
                                        <span className="rounded-full bg-[#E8F5F3] px-2.5 py-1 text-xs font-medium text-[#0F766E]">
                                            {row.products} products
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default AdminReportsPage;