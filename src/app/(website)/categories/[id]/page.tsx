"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, PackageSearch } from "lucide-react";

interface CategoryProduct {
  id: string;
  name: string;
  images: string[];
  regularPrice: number;
  salePrice?: number | null;
  stockQuantity: number;
}

interface CategoryDetail {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  products: CategoryProduct[];
}

interface CategoryDetailResponse {
  success: boolean;
  data: CategoryDetail;
  message?: string;
}

const CategoryDetailPage = () => {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const response = await fetch(
          `${API_URL}/api/v1/categories/${categoryId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );

        const result: CategoryDetailResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load category");
        }

        setCategory({
          ...result.data,
          products: Array.isArray(result.data?.products)
            ? result.data.products
            : [],
        });
      } catch (err) {
        console.error("Category detail error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load category"
        );
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="font-['Poppins'] text-base text-[#64748B]">
          Loading category...
        </p>
      </main>
    );
  }

  if (error || !category) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-4">
        <p className="font-['Poppins'] text-lg text-red-500">
          {error || "Category not found"}
        </p>

        <Link
          href="/categories"
          className="rounded-lg bg-[#0F766E] px-6 py-3 font-['Poppins'] text-sm font-medium text-white transition hover:bg-[#0B625B]"
        >
          Back to Categories
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Breadcrumb */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 font-['Poppins'] text-sm font-medium text-[#64748B] transition hover:text-[#0F766E]"
        >
          <ArrowLeft size={16} />
          Back to Categories
        </Link>

        {/* Category Header */}
        <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-[#E8EEEE] bg-white p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E8EEEE] bg-[#F6FAF9]">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover mix-blend-multiply"
                height={512}
                width={512}
              />
            ) : (
              <span className="font-['Poppins'] text-3xl font-bold text-[#0F766E]">
                {category.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-['Poppins'] text-2xl font-bold text-[#1E293B] sm:text-3xl">
              {category.name}
            </h1>

            <p className="mt-2 font-['Poppins'] text-sm text-[#64748B]">
              {category.description ||
                `Explore products in ${category.name}.`}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
              <PackageSearch size={16} className="text-[#0F766E]" />
              <span className="font-['Poppins'] text-sm font-medium text-[#334155]">
                {category.productCount}{" "}
                {category.productCount === 1 ? "Product" : "Products"}
              </span>
            </div>
          </div>

          
        </div>

        {/* Products */}
        <div className="mt-8">
          {category.products.length === 0 ? (
            <div className="rounded-xl border border-[#E8EEEE] bg-white px-6 py-20 text-center">
              <PackageSearch size={36} className="mx-auto text-[#94A3B8]" />
              <p className="mt-4 font-['Poppins'] text-sm text-[#64748B]">
                No products listed under this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {category.products.map((product) => {
                const price =
                  product.salePrice && product.salePrice > 0
                    ? product.salePrice
                    : product.regularPrice;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group overflow-hidden rounded-xl border border-[#E8EEEE] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(15,118,110,0.10)]"
                  >
                    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#F6FAF9]">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain p-4"
                        />
                      ) : (
                        <PackageSearch size={28} className="text-[#94A3B8]" />
                      )}
                    </div>

                    <div className="p-4">
                      <p className="truncate font-['Poppins'] text-sm font-semibold text-[#1E293B] group-hover:text-[#0F766E]">
                        {product.name}
                      </p>

                      <p className="mt-1 font-['Poppins'] text-sm font-bold text-[#0F766E]">
                        ${price.toFixed(2)}
                      </p>

                      <p className="mt-1 font-['Poppins'] text-xs text-[#94A3B8]">
                        {product.stockQuantity > 0
                          ? `${product.stockQuantity} in stock`
                          : "Out of stock"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CategoryDetailPage;