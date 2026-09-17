"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, PackageSearch } from "lucide-react";

interface BrandProduct {
  id: string;
  name: string;
  images: string[];
  regularPrice: number;
  salePrice?: number | null;
  stockQuantity: number;
}

interface BrandDetail {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  productCount: number;
  products: BrandProduct[];
}

interface BrandDetailResponse {
  success: boolean;
  data: BrandDetail;
  message?: string;
}

const BrandDetailPage = () => {
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        setError("");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const response = await fetch(`${API_URL}/api/v1/brands/${brandId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const result: BrandDetailResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load brand");
        }

        setBrand(result.data);
      } catch (err) {
        console.error("Brand detail error:", err);
        setError(err instanceof Error ? err.message : "Failed to load brand");
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="font-['Poppins'] text-base text-[#64748B]">
          Loading brand...
        </p>
      </main>
    );
  }

  if (error || !brand) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-4">
        <p className="font-['Poppins'] text-lg text-red-500">
          {error || "Brand not found"}
        </p>

        <Link
          href="/brands"
          className="rounded-lg bg-[#0F766E] px-6 py-3 font-['Poppins'] text-sm font-medium text-white transition hover:bg-[#0B625B]"
        >
          Back to Brands
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Breadcrumb */}
        <Link
          href="/brands"
          className="inline-flex items-center gap-2 font-['Poppins'] text-sm font-medium text-[#64748B] transition hover:text-[#0F766E]"
        >
          <ArrowLeft size={16} />
          Back to Brands
        </Link>

        {/* Brand Header */}
        <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-[#E8EEEE] bg-white p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E8EEEE] bg-[#F6FAF9]">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <span className="font-['Poppins'] text-3xl font-bold text-[#0F766E]">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-['Poppins'] text-2xl font-bold text-[#1E293B] sm:text-3xl">
              {brand.name}
            </h1>

            <p className="mt-2 font-['Poppins'] text-sm text-[#64748B]">
              {brand.description || `Explore products from ${brand.name}.`}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
              <PackageSearch size={16} className="text-[#0F766E]" />
              <span className="font-['Poppins'] text-sm font-medium text-[#334155]">
                {brand.productCount}{" "}
                {brand.productCount === 1 ? "Product" : "Products"}
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="inline-flex cursor-pointer shrink-0 items-center gap-2 rounded-lg bg-[#0F766E] px-6 py-3 font-['Poppins'] text-sm font-semibold text-white transition hover:bg-[#0B625B]"
          >
            Shop Now
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Products */}
        <div className="mt-8">
          {brand.products.length === 0 ? (
            <div className="rounded-xl border border-[#E8EEEE] bg-white px-6 py-20 text-center">
              <PackageSearch size={36} className="mx-auto text-[#94A3B8]" />
              <p className="mt-4 font-['Poppins'] text-sm text-[#64748B]">
                No products listed under this brand yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {brand.products.map((product) => {
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

export default BrandDetailPage;