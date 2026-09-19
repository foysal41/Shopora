"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

// Fallback images for categories that don't have an image saved yet,
// matched by category name. Used only when category.image is missing.
const fallbackImages: Record<string, string> = {
  Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  Fashion: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "Home & Living":
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
  "Beauty & Personal Care":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
  "Sports & Outdoors":
    "https://images.unsplash.com/photo-1546519638-68e109498ffc",
  "Baby & Toys":
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1",
};

const CategoryShowCase = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCategories = async () => {
      try {
        setLoading(true);

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
        console.error("CategoryShowCase error:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  // Only show up to 6 categories on the homepage showcase.
  const displayedCategories = categories.slice(0, 6);

  return (
    <section className="bg-white px-4  py-30 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-['Poppins'] text-lg font-semibold tracking-tight text-[#1E293B] sm:text-xl">
            Shop by Categories
          </h2>

          <Link
            href="/categories"
            className="group flex items-center gap-1.5 font-['Poppins'] text-xs font-medium text-[#0F766E] transition-colors duration-300 hover:text-[#FF6B6B] sm:text-sm"
          >
            View All Categories

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white"
              >
                <div className="h-32 animate-pulse bg-[#EEF2F2] sm:h-36" />

                <div className="space-y-2 px-3 pb-4 pt-3">
                  <div className="mx-auto h-3 w-2/3 animate-pulse rounded bg-[#EEF2F2]" />
                  <div className="mx-auto h-2 w-1/2 animate-pulse rounded bg-[#EEF2F2]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {displayedCategories.map((category) => {
              const productCount =
                category.products ??
                category.productCount ??
                category._count?.products ??
                0;

              const image =
                category.image || fallbackImages[category.name] || null;

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-[#E8EEEE] bg-white shadow-[0_2px_12px_rgba(15,118,110,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CFE7E4] hover:shadow-[0_8px_25px_rgba(15,118,110,0.10)]"
                >
                  {/* Image */}
                  <div className="flex h-32 items-center justify-center overflow-hidden bg-[#F6FAF9] px-4 py-3 sm:h-36">
                    {image ? (
                      <Image
                        src={image}
                        alt={category.name}
                        className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        height={512}
                        width={512}
                      />
                    ) : (
                      <span className="font-['Poppins'] text-2xl font-bold text-[#0F766E]">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-3 pb-4 pt-3 text-center">
                    <h3 className="truncate font-['Poppins'] text-xs font-semibold text-[#1E293B] md:text-lg">
                      {category.name}
                    </h3>

                    <p className="mt-1 font-['Poppins'] text-[10px] text-[#94A3B8] sm:text-[11px]">
                      {productCount}{" "}
                      {productCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryShowCase;