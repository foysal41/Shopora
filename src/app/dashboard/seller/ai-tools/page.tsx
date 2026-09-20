"use client";

import { useEffect, useState } from "react";
import { Clipboard, FileText, Loader2, Package, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { generateProductDescription } from "@/lib/ai";
import { getProducts } from "@/lib/api/getProducts";
import type { getProduct } from "@/type/dashboard/Seller";

export default function SellerAIAssistantPage() {
    const [products, setProducts] = useState<getProduct[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [generated, setGenerated] = useState({ shortDescription: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const result = await getProducts();
                setProducts(result);
                setSelectedId(result[0]?.id || "");
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
            } finally {
                setLoading(false);
            }
        };
        void loadProducts();
    }, []);

    const selectedProduct = products.find((product) => product.id === selectedId);

    const generateContent = async () => {
        if (!selectedProduct) return;
        try {
            setGenerating(true);
            setError("");
            setGenerated(
                await generateProductDescription({
                    productName: selectedProduct.name,
                    category: selectedProduct.category || "General merchandise",
                    shortDescription: selectedProduct.shortDescription || undefined,
                })
            );
            toast.success("Product copy generated");
        } catch (generationError) {
            setError(generationError instanceof Error ? generationError.message : "Unable to generate product copy.");
        } finally {
            setGenerating(false);
        }
    };

    const copyText = async (value: string, label: string) => {
        if (!value) return;
        await navigator.clipboard.writeText(value);
        toast.success(`${label} copied`);
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 font-['Poppins'] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-6">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0F766E]">
                        <Sparkles size={15} /> Seller workspace
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold text-[#0F172A] sm:text-3xl">AI Assistant</h1>
                    <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
                        Create polished product descriptions from your existing catalog details.
                    </p>
                </header>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <section className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                    <div className="rounded-xl border border-[#E8EEEE] bg-white p-5">
                        <div className="flex items-center gap-2">
                            <Package size={18} className="text-[#0F766E]" />
                            <h2 className="font-semibold text-[#1E293B]">Choose a product</h2>
                        </div>
                        <p className="mt-1 text-sm text-[#64748B]">
                            Select a listing and generate copy you can review before updating it.
                        </p>
                        <select
                            value={selectedId}
                            onChange={(event) => {
                                setSelectedId(event.target.value);
                                setGenerated({ shortDescription: "", description: "" });
                            }}
                            disabled={loading || products.length === 0}
                            className="mt-5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#334155] outline-none focus:border-[#0F766E]"
                        >
                            <option value="">{loading ? "Loading products..." : "No products available"}</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>

                        {selectedProduct && (
                            <div className="mt-4 rounded-lg bg-[#F8FAFC] p-4 text-sm">
                                <div className="flex justify-between gap-3">
                                    <span className="text-[#64748B]">Category</span>
                                    <span className="font-medium text-[#334155]">{selectedProduct.category || "Uncategorized"}</span>
                                </div>
                                <div className="mt-2 flex justify-between gap-3">
                                    <span className="text-[#64748B]">Current description</span>
                                    <span className="font-medium text-[#334155]">
                                        {selectedProduct.shortDescription ? "Available" : "Missing"}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => void generateContent()}
                            disabled={generating || !selectedProduct}
                            className="mt-5 cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {generating ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                            {generating ? "Generating..." : "Generate product copy"}
                        </button>
                    </div>

                    <div className="rounded-xl border border-[#E8EEEE] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-[#1E293B]">Generated content</h2>
                                <p className="mt-1 text-sm text-[#64748B]">
                                    Review and copy the draft into your product editor.
                                </p>
                            </div>
                            <FileText size={20} className="text-[#0F766E]" />
                        </div>

                        <div className="mt-5 space-y-4">
                            {[
                                ["Short description", generated.shortDescription, 3],
                                ["Full description", generated.description, 8],
                            ].map(([label, value, rows]) => (
                                <div key={label as string}>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="text-xs font-medium text-[#475569]">{label as string}</label>
                                        <button
                                            type="button"
                                            onClick={() => void copyText(value as string, label as string)}
                                            disabled={!value}
                                            className="flex items-center gap-1 text-xs font-medium text-[#0F766E] disabled:opacity-40"
                                        >
                                            <Clipboard size={13} /> Copy
                                        </button>
                                    </div>
                                    <textarea
                                        value={value as string}
                                        readOnly
                                        placeholder="Generated copy will appear here"
                                        rows={rows as number}
                                        className="w-full resize-y rounded-lg border border-[#E2E8F0] bg-[#FCFDFD] p-3 text-sm leading-6 text-[#334155] outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}