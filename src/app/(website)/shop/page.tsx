"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Search,
  SlidersHorizontal,
  Star,
  ShoppingCart,
  X,
  ChevronDown,
  PackageSearch,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  brand?: string;
  shortDescription?: string;
  regularPrice: number | string;
  salePrice?: number | string | null;
  images?: string[];
  rating?: number;
  stock?: number;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  message?: string;
}

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Sports",
  "Accessories",
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Name: A-Z", value: "name" },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    async function getProducts() {
      try {
        setLoading(true);
        setError("");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const response = await fetch(
          `${API_URL}/api/v1/products`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result: ProductsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch products"
          );
        }

        setProducts(result.data || []);
      } catch (err) {
        console.error("Shop products error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    }

    getProducts();
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query)
        );
      });
    }

    // Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (product) =>
          product.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    // Price
    if (minPrice) {
      result = result.filter(
        (product) =>
          Number(product.salePrice ?? product.regularPrice) >=
          Number(minPrice)
      );
    }

    if (maxPrice) {
      result = result.filter(
        (product) =>
          Number(product.salePrice ?? product.regularPrice) <=
          Number(maxPrice)
      );
    }

    // Sorting
    switch (sort) {
      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.salePrice ?? a.regularPrice) -
            Number(b.salePrice ?? b.regularPrice)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.salePrice ?? b.regularPrice) -
            Number(a.salePrice ?? a.regularPrice)
        );
        break;

      case "name":
        result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    minPrice,
    maxPrice,
    sort,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
 

      {/* =====================================================
          MAIN SHOP AREA
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Mobile filter button */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <p className="font-['Poppins'] text-sm text-[#64748B]">
            <span className="font-semibold text-[#1E293B]">
              {filteredProducts.length}
            </span>{" "}
            products
          </p>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 font-['Poppins'] text-sm font-medium text-[#334155]"
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* =================================================
              DESKTOP SIDEBAR
          ================================================== */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-[#E8EEEE] bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-['Poppins'] text-base font-semibold text-[#1E293B]">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-['Poppins'] cursor-pointer text-xs font-medium text-[#0F766E] hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="mt-6">
                <h3 className="font-['Poppins'] text-sm font-semibold text-[#334155]">
                  Categories
                </h3>

                <div className="mt-3 space-y-1 cursor-pointer">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                      className={`flex cursor-pointer w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-['Poppins'] text-sm transition ${
                        selectedCategory === category
                          ? "bg-[#E8F5F3] font-semibold text-[#0F766E]"
                          : "text-[#64748B] hover:bg-[#F6FAF9] hover:text-[#0F766E]"
                      }`}
                    >
                      {category}

                      {selectedCategory === category && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mt-7 border-t border-[#EEF2F2] pt-6">
                <h3 className="font-['Poppins'] text-sm font-semibold text-[#334155]">
                  Price Range
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(e.target.value)
                    }
                    placeholder="Min"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 font-['Poppins'] text-sm outline-none focus:border-[#0F766E]"
                  />

                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(e.target.value)
                    }
                    placeholder="Max"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 font-['Poppins'] text-sm outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* =================================================
              PRODUCTS
          ================================================== */}
          <div>
            {/* Toolbar */}
            <div className="mb-6 hidden items-center justify-between lg:flex">
              <div>
                <h2 className="font-['Poppins'] text-lg font-semibold text-[#1E293B]">
                  All Products
                </h2>

                <p className="mt-1 font-['Poppins'] text-xs text-[#94A3B8]">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              <div className="relative cursor-pointer">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none cursor-pointer rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-4 pr-10 font-['Poppins'] text-sm text-[#475569] outline-none focus:border-[#0F766E]"
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
              </div>
            </div>

            {/* Mobile sort */}
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <h2 className="font-['Poppins'] text-lg font-semibold text-[#1E293B]">
                Products
              </h2>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 font-['Poppins'] text-xs text-[#475569] outline-none"
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white"
                  >
                    <div className="h-64 animate-pulse bg-[#EEF2F2]" />

                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-[#EEF2F2]" />
                      <div className="h-3 w-full animate-pulse rounded bg-[#EEF2F2]" />
                      <div className="h-5 w-1/3 animate-pulse rounded bg-[#EEF2F2]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl border border-[#FECACA] bg-[#FFF7F7] px-6 py-12 text-center">
                <PackageSearch
                  size={42}
                  className="mx-auto text-[#FF6B6B]"
                />

                <h2 className="mt-4 font-['Poppins'] text-lg font-semibold text-[#1E293B]">
                  Unable to load products
                </h2>

                <p className="mt-2 font-['Poppins'] text-sm text-[#64748B]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-lg bg-[#0F766E] px-5 py-2.5 font-['Poppins'] text-sm font-medium text-white hover:bg-[#0B625B]"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading &&
              !error &&
              filteredProducts.length === 0 && (
                <div className="rounded-xl border border-[#E8EEEE] bg-white px-6 py-20 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5F3]">
                    <PackageSearch
                      size={30}
                      className="text-[#0F766E]"
                    />
                  </div>

                  <h2 className="mt-5 font-['Poppins'] text-xl font-semibold text-[#1E293B]">
                    No products found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md font-['Poppins'] text-sm leading-6 text-[#64748B]">
                    We couldnt find products matching your
                    current filters. Try another search or clear
                    the filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-lg bg-[#0F766E] px-5 py-2.5 font-['Poppins'] text-sm font-medium text-white hover:bg-[#0B625B]"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            {/* Product Grid */}
            {!loading &&
              !error &&
              filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const price = Number(
                      product.salePrice ??
                        product.regularPrice
                    );

                    const regularPrice = Number(
                      product.regularPrice
                    );

                    const hasSale =
                      product.salePrice !== null &&
                      product.salePrice !== undefined &&
                      price < regularPrice;

                    const discount = hasSale
                      ? Math.round(
                          ((regularPrice - price) /
                            regularPrice) *
                            100
                        )
                      : 0;

                    const isWishlisted =
                      wishlist.includes(product.id);

                    return (
                      <article
                        key={product.id}
                        className="group overflow-hidden rounded-xl border border-[#E8EEEE] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#D3E7E4] hover:shadow-[0_12px_30px_rgba(15,118,110,0.10)]"
                      >
                        {/* Image */}
                        <div className="relative h-64 overflow-hidden bg-[#F6FAF9]">
                          <Link
                            href={`/products/${product.id}`}
                            className="block h-full w-full"
                          >
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <PackageSearch
                                  size={42}
                                  className="text-[#CBD5E1]"
                                />
                              </div>
                            )}
                          </Link>

                          {/* Sale */}
                          {hasSale && (
                            <span className="absolute left-3 top-3 rounded-md bg-[#FF6B6B] px-2.5 py-1 font-['Poppins'] text-[11px] font-semibold text-white">
                              -{discount}%
                            </span>
                          )}

                          {/* Wishlist */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleWishlist(product.id)
                            }
                            aria-label="Add to wishlist"
                            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition ${
                              isWishlisted
                                ? "text-[#FF6B6B]"
                                : "text-[#64748B] hover:text-[#FF6B6B]"
                            }`}
                          >
                            <Heart
                              size={18}
                              strokeWidth={1.7}
                              fill={
                                isWishlisted
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-['Poppins'] text-[11px] font-medium uppercase tracking-wide text-[#0F766E]">
                              {product.category ||
                                "Product"}
                            </span>

                            {product.brand && (
                              <span className="max-w-24 truncate font-['Poppins'] text-[11px] text-[#94A3B8]">
                                {product.brand}
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/products/${product.id}`}
                          >
                            <h3 className="mt-2 line-clamp-2 min-h-12 font-['Poppins'] text-base font-semibold leading-6 text-[#1E293B] transition-colors hover:text-[#0F766E]">
                              {product.name}
                            </h3>
                          </Link>

                          {product.shortDescription && (
                            <p className="mt-2 line-clamp-2 font-['Poppins'] text-xs leading-5 text-[#94A3B8]">
                              {product.shortDescription}
                            </p>
                          )}

                          {/* Rating */}
                          <div className="mt-3 flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {Array.from({
                                length: 5,
                              }).map((_, index) => (
                                <Star
                                  key={index}
                                  size={13}
                                  fill={
                                    index <
                                    Math.round(
                                      product.rating || 0
                                    )
                                      ? "currentColor"
                                      : "none"
                                  }
                                  className="text-[#F59E0B]"
                                />
                              ))}
                            </div>

                            <span className="font-['Poppins'] text-[11px] text-[#94A3B8]">
                              {product.rating
                                ? product.rating.toFixed(1)
                                : "New"}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-['Poppins'] text-lg font-bold text-[#0F766E]">
                                ${price.toFixed(2)}
                              </span>

                              {hasSale && (
                                <span className="font-['Poppins'] text-xs text-[#94A3B8] line-through">
                                  ${regularPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Cart */}
                            <button
                              type="button"
                              aria-label="Add to cart"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F5F3] text-[#0F766E] transition-colors hover:bg-[#0F766E] hover:text-white"
                            >
                              <ShoppingCart size={17} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ====================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-['Poppins'] text-lg font-semibold text-[#1E293B]">
                Filters
              </h2>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6FAF9] text-[#64748B]"
              >
                <X size={19} />
              </button>
            </div>

            {/* Categories */}
            <div className="mt-6">
              <h3 className="font-['Poppins'] text-sm font-semibold text-[#334155]">
                Categories
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(category)
                    }
                    className={`rounded-lg border px-3 py-2.5 text-left font-['Poppins'] text-sm ${
                      selectedCategory === category
                        ? "border-[#0F766E] bg-[#E8F5F3] font-semibold text-[#0F766E]"
                        : "border-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mt-6">
              <h3 className="font-['Poppins'] text-sm font-semibold text-[#334155]">
                Price Range
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(e.target.value)
                  }
                  placeholder="Minimum"
                  className="rounded-lg border border-[#E2E8F0] px-3 py-3 font-['Poppins'] text-sm outline-none focus:border-[#0F766E]"
                />

                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value)
                  }
                  placeholder="Maximum"
                  className="rounded-lg border border-[#E2E8F0] px-3 py-3 font-['Poppins'] text-sm outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-lg border border-[#0F766E] py-3 font-['Poppins'] text-sm font-medium text-[#0F766E]"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-lg bg-[#0F766E] py-3 font-['Poppins'] text-sm font-medium text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}