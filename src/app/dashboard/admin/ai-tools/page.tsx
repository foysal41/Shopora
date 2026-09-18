"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clipboard, FileText, Loader2, Package, ScanSearch, Sparkles, type LucideIcon } from "lucide-react";
import toast from "react-hot-toast";
import { generateProductDescription } from "@/lib/ai";
import { getAdminProducts, type AdminProduct } from "@/lib/api/adminProducts";

const AdminAiToolsPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [generated, setGenerated] = useState({ shortDescription: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAdminProducts();
      setProducts(result);
      setSelectedId((currentId) => currentId || result[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProducts(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const selectedProduct = products.find((product) => product.id === selectedId);
  const audit = useMemo(() => ({
    total: products.length,
    missingDescription: products.filter((product) => !product.shortDescription?.trim()).length,
    lowStock: products.filter((product) => product.stockQuantity <= 5).length,
    missingImage: products.filter((product) => !product.images?.length).length,
  }), [products]);
  const auditCards: Array<{ label: string; value: number; Icon: LucideIcon; tone: string }> = [
    { label: "Catalog products", value: audit.total, Icon: Package, tone: "text-[#0F766E] bg-[#E8F5F3]" },
    { label: "Missing descriptions", value: audit.missingDescription, Icon: FileText, tone: "text-amber-600 bg-amber-50" },
    { label: "Low stock items", value: audit.lowStock, Icon: Package, tone: "text-red-600 bg-red-50" },
    { label: "Missing product images", value: audit.missingImage, Icon: ScanSearch, tone: "text-blue-600 bg-blue-50" },
  ];

  const generateContent = async () => {
    if (!selectedProduct) return;

    try {
      setGenerating(true);
      setError("");
      const result = await generateProductDescription({
        productName: selectedProduct.name,
        category: selectedProduct.category || "General merchandise",
        shortDescription: selectedProduct.shortDescription || undefined,
      });
      setGenerated(result);
      toast.success("Product content generated");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Unable to copy content");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 font-['Poppins'] sm:px-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]"><Sparkles size={15} /> Admin AI workspace</p>
            <h1 className="mt-2 text-2xl font-semibold text-[#0F172A]">Catalog Copilot</h1>
            <p className="mt-1 max-w-2xl text-sm text-[#64748B]">Generate consistent product copy and find catalog gaps before they affect the storefront.</p>
          </div>
          <button type="button" onClick={() => void loadProducts()} disabled={loading} className="flex cursor-pointer items-center gap-2 self-start rounded-lg border border-[#E8EEEE] bg-white px-3 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F6FAF9] disabled:cursor-not-allowed disabled:opacity-60"><ScanSearch size={16} /> Refresh audit</button>
        </header>

        {error && <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {auditCards.map(({ label, value, Icon, tone }) => <div key={label} className="flex items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></div><div><p className="text-xs text-[#64748B]">{label}</p><p className="mt-0.5 text-xl font-semibold text-[#0F172A]">{loading ? "..." : value}</p></div></div>)}
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-xl border border-[#E8EEEE] bg-white p-5">
            <div className="flex items-center gap-2"><Sparkles size={18} className="text-[#0F766E]" /><h2 className="font-semibold text-[#1E293B]">Product content studio</h2></div>
            <p className="mt-1 text-sm text-[#64748B]">Choose an existing catalog item and create polished copy from its real product details.</p>
            <label className="mt-5 block text-xs font-medium text-[#475569]" htmlFor="ai-product">Product</label>
            <select id="ai-product" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setGenerated({ shortDescription: "", description: "" }); }} disabled={loading || products.length === 0} className="mt-2 w-full cursor-pointer rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#334155] outline-none focus:border-[#0F766E]">
              {products.length === 0 ? <option value="">No products available</option> : products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            {selectedProduct && <div className="mt-4 rounded-lg bg-[#F8FAFC] p-4 text-sm"><div className="flex justify-between gap-3"><span className="text-[#64748B]">Category</span><span className="font-medium text-[#334155]">{selectedProduct.category || "Uncategorized"}</span></div><div className="mt-2 flex justify-between gap-3"><span className="text-[#64748B]">Current description</span><span className="text-right font-medium text-[#334155]">{selectedProduct.shortDescription ? "Available" : "Missing"}</span></div></div>}
            <button type="button" onClick={() => void generateContent()} disabled={generating || !selectedProduct} className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:opacity-60">{generating ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}{generating ? "Generating..." : "Generate product copy"}</button>
          </div>

          <div className="rounded-xl border border-[#E8EEEE] bg-white p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-[#1E293B]">Generated content</h2><p className="mt-1 text-sm text-[#64748B]">Review the draft, then copy it into the product editor.</p></div><FileText size={20} className="text-[#0F766E]" /></div>
            <div className="mt-5 space-y-4">
              {[['Short description', generated.shortDescription], ['Full description', generated.description]].map(([label, value]) => <div key={label}><div className="mb-1 flex items-center justify-between"><label className="text-xs font-medium text-[#475569]">{label}</label><button type="button" onClick={() => void copyText(value, label)} disabled={!value} className="flex cursor-pointer items-center gap-1 text-xs font-medium text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40"><Clipboard size={13} /> Copy</button></div><textarea value={value} readOnly placeholder="Generated copy will appear here" rows={label === 'Full description' ? 8 : 3} className="w-full resize-y rounded-lg border border-[#E2E8F0] bg-[#FCFDFD] p-3 text-sm leading-6 text-[#334155] outline-none" /></div>)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminAiToolsPage;
