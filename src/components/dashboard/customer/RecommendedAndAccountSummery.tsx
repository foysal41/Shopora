import { ChevronRight, CircleUserRound, LockKeyhole, MapPin, ShoppingCart, Star, WalletCards } from 'lucide-react'
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import type { getProduct } from '@/type/dashboard/Seller';

type RecommendedAndAccountSummeryProps = {
  products: getProduct[];
  loading?: boolean;
};

const RecommendedAndAccountSummery = ({
  products,
  loading,
}: RecommendedAndAccountSummeryProps) => {
  const recommendedProducts = products.slice(0, 5);

  return (
       <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">

        {/* Recommended Products */}
        <div className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">

          <div className="flex items-center justify-between px-5 py-4">

            <h2 className="font-['Poppins'] text-[16px] font-semibold text-[#0F172A]">
              Recommended for You
            </h2>

            <Link
              href="/shop"
              className="flex items-center gap-1 font-['Poppins'] text-[14px] font-medium text-[#0F766E]"
            >
              View All
              <ChevronRight size={16} />
            </Link>

          </div>


          {loading ? (
            <p className="px-4 pb-6 pt-4 text-center font-['Poppins'] text-[14px] text-[#64748B]">
              Loading products...
            </p>
          ) : recommendedProducts.length === 0 ? (
            <p className="px-4 pb-6 pt-4 text-center font-['Poppins'] text-[14px] text-[#64748B]">
              No products available right now.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">

              {recommendedProducts.map((product) => {
                const price =
                  product.salePrice && product.salePrice > 0
                    ? product.salePrice
                    : product.regularPrice;

                return (
                  <div
                    key={product.id}
                    className="group rounded-lg border border-[#E8EEEE] bg-white p-3 transition duration-300 hover:-translate-y-1 hover:shadow-md"
                  >

                    <Link href={`/products/${product.id}`} className="block">

                      {/* Product Image */}
                      <div className="flex h-32 items-center justify-center overflow-hidden rounded-md bg-[#F8FAFC]">

                        <Image
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105"
                          height={512}
                          width={512}
                        />

                      </div>


                      {/* Product Name */}
                      <h3 className="mt-3 min-h-10.5 font-['Poppins'] text-[14px] font-medium leading-5 text-[#334155]">
                        {product.name}
                      </h3>


                      {/* Category */}
                      <div className="mt-2 flex items-center gap-1">

                        <Star
                          size={14}
                          fill="#F59E0B"
                          className="text-[#F59E0B]"
                        />

                        <span className="truncate font-['Poppins'] text-[14px] text-[#64748B]">
                          {product.category}
                        </span>

                      </div>


                      {/* Price */}
                      <p className="mt-2 font-['Poppins'] text-[16px] font-bold text-[#1E293B]">
                        ${price.toFixed(2)}
                      </p>

                    </Link>


                    {/* Add Cart */}
                    <Link
                      href={`/products/${product.id}`}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-[#0F766E] px-2 py-2 font-['Poppins'] text-[14px] font-semibold text-[#0F766E] transition hover:bg-[#0F766E] hover:text-white"
                    >
                      <ShoppingCart size={15} />
                      Buy Now
                    </Link>

                  </div>
                );
              })}

            </div>
          )}

        </div>


        {/* Account Summary */}
        <div className="rounded-xl border border-[#E8EEEE] bg-white">

          <div className="flex items-center justify-between px-5 py-4">

            <h2 className="font-['Poppins'] text-[16px] font-semibold text-[#0F172A]">
              Account Summary
            </h2>

          </div>


          <div className="px-4 pb-4">

            {/* Personal Information */}
            <div className="flex items-center gap-3 border-b border-[#E8EEEE] py-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3]">
                <CircleUserRound
                  size={20}
                  className="text-[#0F766E]"
                />
              </div>

              <div className="min-w-0 flex-1">

                <h3 className="font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                  Personal Information
                </h3>

                <p className="mt-0.5 font-['Poppins'] text-[14px] text-[#64748B]">
                  Manage your name, email, and phone
                </p>

              </div>

              <button
                type="button"
                className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]"
              >
                Edit
              </button>

            </div>


            {/* Shipping Addresses */}
            <div className="flex items-center gap-3 border-b border-[#E8EEEE] py-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3]">
                <MapPin
                  size={20}
                  className="text-[#0F766E]"
                />
              </div>

              <div className="min-w-0 flex-1">

                <h3 className="font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                  Shipping Addresses
                </h3>

                <p className="mt-0.5 font-['Poppins'] text-[14px] text-[#64748B]">
                  Manage your saved addresses
                </p>

              </div>

              <Link
                href="/dashboard/customer/addresses"
                className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]"
              >
                Manage
              </Link>

            </div>


            {/* Payment Methods */}
            <div className="flex items-center gap-3 border-b border-[#E8EEEE] py-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3]">
                <WalletCards
                  size={20}
                  className="text-[#0F766E]"
                />
              </div>

              <div className="min-w-0 flex-1">

                <h3 className="font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                  Payment Methods
                </h3>

                <p className="mt-0.5 font-['Poppins'] text-[14px] text-[#64748B]">
                  Manage your saved payment methods
                </p>

              </div>

              <button
                type="button"
                className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]"
              >
                Manage
              </button>

            </div>


            {/* Password & Security */}
            <div className="flex items-center gap-3 py-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3]">
                <LockKeyhole
                  size={20}
                  className="text-[#0F766E]"
                />
              </div>

              <div className="min-w-0 flex-1">

                <h3 className="font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                  Password &amp; Security
                </h3>

                <p className="mt-0.5 font-['Poppins'] text-[14px] text-[#64748B]">
                  Update your password and security
                </p>

              </div>

              <button
                type="button"
                className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]"
              >
                Manage
              </button>

            </div>

          </div>

        </div>

      </section>

  )
}

export default RecommendedAndAccountSummery