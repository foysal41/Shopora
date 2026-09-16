"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, RefreshCw, Search, ShoppingCart, Sparkles, Star } from "lucide-react";
import { useSession } from "@/app/lib/auth-client";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { getProducts } from "@/lib/api/getProducts";
import type { getProduct } from "@/type/dashboard/Seller";

type Recommendation = getProduct & { score: number; reason: string };

const priceOf = (product: getProduct) =>
  product.salePrice > 0 ? product.salePrice : product.regularPrice;

export default function AIRecommendationsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const userId = session?.user?.id;
  const [products, setProducts] = useState<getProduct[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const [productResult, wishlistResult] = await Promise.all([
        getProducts(),
        getWishlist(userId),
      ]);

      setProducts(productResult);
      setWishlistIds(wishlistResult.map((item) => item.id));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your recommendations."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (sessionLoading || !userId) return;
    void Promise.resolve().then(loadRecommendations);
  }, [loadRecommendations, sessionLoading, userId]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort(),
    ],
    [products]
  );

  const recommendations = useMemo<Recommendation[]>(() => {
    const saved = products.filter((product) => wishlistIds.includes(product.id));
    const savedCategories = new Set(saved.map((product) => product.category.toLowerCase()));
    const savedBrands = new Set(saved.map((product) => product.brand.toLowerCase()));
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => product.stockQuantity > 0)
      .filter((product) => category === "All" || product.category === category)
      .filter((product) =>
        !query || [product.name, product.brand, product.category]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .map((product) => {
        const brandMatch = savedBrands.has(product.brand.toLowerCase());
        const categoryMatch = savedCategories.has(product.category.toLowerCase());
        const discounted = product.salePrice > 0 && product.salePrice < product.regularPrice;

        return {
          ...product,
          score: (brandMatch ? 5 : 0) + (categoryMatch ? 3 : 0) + (discounted ? 2 : 0),
          reason: brandMatch
            ? `Because you like ${product.brand}`
            : categoryMatch
              ? `More from ${product.category}`
              : discounted
                ? "A fresh deal picked for you"
                : "A popular pick from our catalog",
        };
      })
      .sort((first, second) => second.score - first.score);
  }, [category, products, search, wishlistIds]);

  const toggleWishlist = async (productId: string) => {
    if (!userId || updatingId) return;

    const isSaved = wishlistIds.includes(productId);
    setUpdatingId(productId);

    try {
      if (isSaved) {
        await removeFromWishlist(userId, productId);
        setWishlistIds((current) => current.filter((id) => id !== productId));
      } else {
        await addToWishlist(userId, productId);
        setWishlistIds((current) => [...current, productId]);
      }
    } catch (wishlistError) {
      setError(
        wishlistError instanceof Error
          ? wishlistError.message
          : "Could not update your wishlist."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pageError = !sessionLoading && !userId
    ? "Please sign in to see recommendations tailored to you."
    : error;
  const pageLoading = sessionLoading || (Boolean(userId) && loading);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl bg-[#0F766E] px-5 py-7 text-white shadow-sm sm:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-[#BFE7E1]">
                <Sparkles size={18} />
                <span className="font-['Poppins'] text-sm font-semibold uppercase tracking-[0.12em]">Shopora AI</span>
              </div>
              <h1 className="mt-2 font-['Poppins'] text-2xl font-semibold sm:text-3xl">Picks that fit your taste</h1>
              <p className="mt-2 max-w-2xl font-['Poppins'] text-sm text-[#D9F2EE]">Recommendations learn from the products you save and the latest deals in the catalog.</p>
            </div>
            <button type="button" onClick={loadRecommendations} disabled={loading || !userId} className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-['Poppins'] text-sm font-semibold text-[#0F766E] transition hover:bg-[#E8F5F3] disabled:cursor-not-allowed disabled:opacity-60">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh picks
            </button>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your recommendations" className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 font-['Poppins'] text-sm text-[#334155] outline-none focus:border-[#0F766E]" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-lg px-3 py-2 font-['Poppins'] text-xs font-medium transition ${category === item ? "bg-[#0F766E] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0F766E] hover:text-[#0F766E]"}`}>
                {item}
              </button>
            ))}
          </div>
        </section>

        {pageError && <div className="mt-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-['Poppins'] text-sm text-[#B91C1C]">{pageError}</div>}

        {pageLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-xl bg-white shadow-sm" />)}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#CBD5E1] bg-white px-5 py-14 text-center">
            <Sparkles className="mx-auto text-[#0F766E]" size={28} />
            <h2 className="mt-3 font-['Poppins'] text-lg font-semibold text-[#1E293B]">No matching recommendations</h2>
            <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">Try another category or clear your search.</p>
          </div>
        ) : (
          <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recommendations.map((product) => {
              const isSaved = wishlistIds.includes(product.id);

              return (
                <article key={product.id} className="group relative overflow-hidden rounded-xl border border-[#E8EEEE] bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <button type="button" aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWishlist(product.id)} disabled={updatingId === product.id} className={`absolute right-5 top-5 z-10 rounded-full bg-white p-2 shadow-sm ${isSaved ? "text-[#EF4444]" : "text-[#64748B] hover:text-[#EF4444]"}`}>
                    <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                  <Link href={`/products/${product.id}`}>
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#F8FAFC]">
                      <Image src={product.images?.[0] || "/placeholder.png"} alt={product.name} width={512} height={512} className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105" />
                    </div>
                    <p className="mt-3 min-h-10 font-['Poppins'] text-sm font-semibold leading-5 text-[#334155]">{product.name}</p>
                    <p className="mt-1 truncate font-['Poppins'] text-xs text-[#0F766E]">{product.reason}</p>
                    <div className="mt-2 flex items-center gap-1 text-[#F59E0B]"><Star size={14} fill="currentColor" /><span className="truncate font-['Poppins'] text-xs text-[#64748B]">{product.brand || product.category}</span></div>
                    <p className="mt-2 font-['Poppins'] text-base font-bold text-[#1E293B]">${priceOf(product).toFixed(2)}</p>
                  </Link>
                  <Link href={`/products/${product.id}`} className="mt-3 flex items-center justify-center gap-1 rounded-md border border-[#0F766E] px-2 py-2 font-['Poppins'] text-xs font-semibold text-[#0F766E] transition hover:bg-[#0F766E] hover:text-white"><ShoppingCart size={14} />View product</Link>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}