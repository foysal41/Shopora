"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Tag,
  PackageSearch,
  ChevronRight,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  products?: number;
  productCount?: number;
  _count?: {
    products?: number;
  };
}

interface CategoriesResponse {
  success: boolean;
  data: CategoryItem[];
  message?: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const response = await fetch(`${API_URL}/api/v1/categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const result: CategoriesResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load categories");
        }

        setCategories(result.data || []);
      } catch (error) {
        console.error("Categories error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
      );
    });
  }, [categories, search]);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* =====================================================
          CATEGORY CONTENT
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-[#FF6B6B]" />

              <p className="font-['Poppins'] text-sm font-semibold uppercase tracking-wider text-[#FF6B6B]">
                Our Collection
              </p>
            </div>

            <h2 className="mt-2 font-['Poppins'] text-2xl font-bold text-[#1E293B] sm:text-3xl">
              Shop by Categories
            </h2>

            <p className="mt-2 font-['Poppins'] text-sm text-[#64748B]">
              Browse products by category and find exactly what you need.
            </p>
          </div>

          {!loading && !error && (
            <span className="hidden font-['Poppins'] text-sm text-[#64748B] sm:block">
              {filteredCategories.length}{" "}
              {filteredCategories.length === 1 ? "category" : "categories"}
            </span>
          )}
        </div>

        {/* =================================================
            LOADING
        ================================================== */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white"
              >
                <div className="h-44 animate-pulse bg-[#EEF2F2]" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#EEF2F2]" />

                  <div className="h-3 w-full animate-pulse rounded bg-[#EEF2F2]" />

                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#EEF2F2]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================== */}
        {!loading && error && (
          <div className="mt-8 rounded-xl border border-[#FECACA] bg-white px-6 py-16 text-center">
            <PackageSearch size={42} className="mx-auto text-[#FF6B6B]" />

            <h2 className="mt-4 font-['Poppins'] text-xl font-semibold text-[#1E293B]">
              Unable to load categories
            </h2>

            <p className="mt-2 font-['Poppins'] text-sm text-[#64748B]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#0F766E] px-5 py-2.5 font-['Poppins'] text-sm font-medium text-white transition hover:bg-[#0B625B]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            EMPTY SEARCH
        ================================================== */}
        {!loading && !error && filteredCategories.length === 0 && (
          <div className="mt-8 rounded-xl border border-[#E8EEEE] bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5F3]">
              <Search size={30} className="text-[#0F766E]" />
            </div>

            <h2 className="mt-5 font-['Poppins'] text-xl font-semibold text-[#1E293B]">
              No categories found
            </h2>

            <p className="mx-auto mt-2 max-w-md font-['Poppins'] text-sm leading-6 text-[#64748B]">
              We couldnt find a category matching {search}. Try searching
              with another name.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-6 rounded-lg bg-[#0F766E] px-5 py-3 font-['Poppins'] text-sm font-medium text-white transition hover:bg-[#0B625B]"
            >
              Show All Categories
            </button>
          </div>
        )}

        {/* =================================================
            CATEGORY GRID
        ================================================== */}
        {!loading && !error && filteredCategories.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => {
              const productCount =
                category.products ??
                category.productCount ??
                category._count?.products ??
                0;

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group overflow-hidden rounded-xl border border-[#E8EEEE] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#D3E7E4] hover:shadow-[0_14px_35px_rgba(15,118,110,0.10)]"
                >
                  {/* Category Image Area */}
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-[#F6FAF9]">
                    {/* Decorative background */}
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E8F5F3] transition-transform duration-500 group-hover:scale-125" />

                    <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-[#FFF1F1]" />

                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="relative h-full w-full object-cover mix-blend-multiply"
                      />
                    ) : (
                      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#E8EEEE] bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <span className="font-['Poppins'] text-3xl font-bold text-[#0F766E]">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate font-['Poppins'] text-lg font-semibold text-[#1E293B] transition-colors group-hover:text-[#0F766E]">
                        {category.name}
                      </h3>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-[#94A3B8] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#0F766E]"
                      />
                    </div>

                    {category.description ? (
                      <p className="mt-2 line-clamp-2 font-['Poppins'] text-xs leading-5 text-[#64748B]">
                        {category.description}
                      </p>
                    ) : (
                      <p className="mt-2 font-['Poppins'] text-xs text-[#94A3B8]">
                        Explore products in {category.name}.
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[#EEF2F2] pt-4">
                      <div className="flex items-center gap-2">
                        <PackageSearch size={15} className="text-[#0F766E]" />

                        <span className="font-['Poppins'] text-xs font-medium text-[#64748B]">
                          {productCount}{" "}
                          {productCount === 1 ? "Product" : "Products"}
                        </span>
                      </div>

                      <span className="font-['Poppins'] cursor-pointer text-xs font-semibold text-[#0F766E]">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}
      {!loading && !error && filteredCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-[#E8F5F3] px-6 py-10 sm:px-10">
            <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
              <div>
                <p className="font-['Poppins'] text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                  Cant decide?
                </p>

                <h2 className="mt-2 font-['Poppins'] text-2xl font-bold text-[#1E293B]">
                  Explore all our products.
                </h2>

                <p className="mt-2 font-['Poppins'] text-sm text-[#64748B]">
                  Discover products across every category.
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0F766E] px-6 py-3 font-['Poppins'] text-sm font-semibold text-white transition hover:bg-[#0B625B]"
              >
                Browse Shop
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default CategoriesPage;