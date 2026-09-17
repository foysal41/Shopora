"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/api/getProducts";
import { addToCart } from "@/lib/cart";
import type { getProduct } from "@/type/dashboard/Seller";
import { toast } from "react-toastify";

const DealsOfTheDay = () => {
  const [products, setProducts] = useState<getProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(8 * 60 * 60 + 45 * 60 + 32);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((error) => console.error("DEALS FETCH ERROR:", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const deals = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.salePrice > 0 && product.salePrice < product.regularPrice,
        )
        .sort(
          (a, b) =>
            (b.regularPrice - b.salePrice) / b.regularPrice -
            (a.regularPrice - a.salePrice) / a.regularPrice,
        ),
    [products],
  );

  const visibleDeals = deals.slice(offset, offset + 5);
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const countdown = `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;

  const addDealToCart = (product: getProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.images?.[0] || null,
      price: product.salePrice,
      quantity: 1,
      inStock: product.stockQuantity > 0,
    });
    window.dispatchEvent(new Event("cart-updated"));
    toast.success("Added to cart");
  };

  return (
    <section className="bg-white px-4 py-15 md:py-15 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-['Poppins'] text-base font-semibold text-[#1E293B] sm:text-lg">
              Deals of the Day
            </h2>

            {/* Countdown */}
            <div className="flex items-center gap-1.5">
              <Clock
                size={12}
                strokeWidth={2.5}
                className="text-[#FF6B6B]"
              />

              <span className="font-['Poppins'] text-[10px] font-medium text-[#FF6B6B] sm:text-[11px]">
                Ends in {countdown}
              </span>
            </div>
          </div>

          {/* View All */}
          <Link
            href="/deals"
            className="group flex cursor-pointer items-center gap-1 font-['Poppins'] text-[10px] font-medium text-[#0F766E] transition-colors duration-300 hover:text-[#FF6B6B] sm:text-xs"
          >
            View All Deals

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Products Wrapper */}
        <div className="relative">

          {/* Left Arrow */}
          <button
            type="button"
            aria-label="Previous deals"
            onClick={() => setOffset((current) => Math.max(0, current - 1))}
            disabled={offset === 0}
            className="absolute -left-3 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm transition-all duration-300 hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40 sm:-left-4"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Products */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {loading ? (
              <p className="col-span-full py-12 text-center font-['Poppins'] text-sm text-[#64748B]">Loading today&apos;s deals...</p>
            ) : visibleDeals.length === 0 ? (
              <p className="col-span-full py-12 text-center font-['Poppins'] text-sm text-[#64748B]">No deals available right now.</p>
            ) : visibleDeals.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-xl border border-[#E8EEEE] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#CFE7E4] hover:shadow-[0_8px_25px_rgba(15,118,110,0.10)]"
              >

                {/* Discount */}
                {product.regularPrice > product.salePrice && (
                  <span className="absolute left-2 top-2 z-10 rounded bg-[#FF6B6B] px-1.5 py-0.5 font-['Poppins'] text-[8px] font-semibold text-white">
                    -{Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}%
                  </span>
                )}

                {/* Product Image */}
                <div className="flex h-32 items-center justify-center bg-[#F6FAF9] px-4 py-3 sm:h-36">
                  <Link href={`/products/${product.id}`} className="block h-full w-full">
                  <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    height={512}
                    width={512}
                  />
                  </Link>
                </div>
               

                {/* Product Info */}
                <div className="px-3 pb-3 pt-2.5">

                  {/* Name */}
                  <Link href={`/products/${product.id}`} className="block truncate font-['Poppins'] font-medium text-[#1E293B] hover:text-[#0F766E] md:text-[16px] text-[14px]">
                    {product.name}
                  </Link>

                  {/* Badge / Short Description */}
                  {product.shortDescription && (
                    <p className="mt-0.5 truncate font-['Poppins'] text-[12px] text-[#94A3B8]">
                      {product.shortDescription}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="mt-1 flex items-center gap-1">
                    <Star
                      size={16}
                      fill="currentColor"
                      className="text-[#FFB020]"
                    />

                    <span className="font-['Poppins'] text-[16px] font-medium text-[#64748B]">
                      0
                    </span>

                    <span className="font-['Poppins'] text-[16px] text-[#94A3B8]">
                      (0)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-['Poppins']  text-[16px] md:text-[18px] font-bold text-[#FF6B6B]">
                      ${product.salePrice.toFixed(2)}
                    </span>

                    {product.regularPrice && (
                      <span className="font-['Poppins'] text-[12px] md:text-[18px] text-[#94A3B8] line-through">
                        ${product.regularPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add To Cart */}
                  <button
                    type="button"
                    onClick={() => addDealToCart(product)}
                    disabled={product.stockQuantity <= 0}
                    className="mt-2.5 w-full cursor-pointer rounded-md bg-[#FF6B6B] py-1.5 font-['Poppins'] text-[12px] font-medium text-white transition-all duration-300 hover:bg-[#f05454] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] md:text-[16px]"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            aria-label="Next deals"
            onClick={() => setOffset((current) => Math.min(Math.max(deals.length - 5, 0), current + 1))}
            disabled={offset >= Math.max(deals.length - 5, 0)}
            className="absolute -right-3 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm transition-all duration-300 hover:border-[#0F766E] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40 sm:-right-4"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Bottom Indicator */}
        <div className="mt-4 flex justify-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-[#0F766E]" />
        </div>
      </div>
    </section>
  );
};

export default DealsOfTheDay;