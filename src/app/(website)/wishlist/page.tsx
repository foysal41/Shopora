"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "@/lib/api/wishlist";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";

const WishlistPage = () => {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const { data: session } = authClient.useSession();
  

  const userId = session?.user?.id;

  /* =========================================================
     FETCH WISHLIST
  ========================================================= */

  useEffect(() => {
    if (!userId) return;
    

    const fetchWishlist = async () => {
      try {
        setIsLoading(true);

        const data = await getWishlist(userId);

        setWishlistItems(data);
      } catch (error) {
        console.error("GET WISHLIST ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  /* =========================================================
     REMOVE SINGLE ITEM
  ========================================================= */

  const handleRemove = async (productId: string) => {
    if (!userId) return;

    try {
      setRemovingId(productId);

      await removeFromWishlist(userId, productId);

      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));

      // Notify Header about wishlist change
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      console.error("REMOVE WISHLIST ERROR:", error);
    } finally {
      setRemovingId(null);
    }
  };

  /* =========================================================
     CLEAR ALL WISHLIST
  ========================================================= */

  const handleClearAll = async () => {
  if (!userId || wishlistItems.length === 0) return;

  try {
    setIsClearing(true);

    await Promise.all(
      wishlistItems.map((item) =>
        removeFromWishlist(userId, item.id)
      )
    );

    // Clear wishlist from current UI
    setWishlistItems([]);

    // Notify Header about wishlist change
    window.dispatchEvent(new Event("wishlist-updated"));
  } catch (error) {
    console.error("CLEAR WISHLIST ERROR:", error);
  } finally {
    setIsClearing(false);
  }
};

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const handleAddToCart = async (product: WishlistItem) => {
  if (!userId) return;

  try {
    // 1. Add product to cart
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
      inStock: product.inStock,
    });

    // 2. Remove product from wishlist
    await removeFromWishlist(userId, product.id);

    // 3. Remove from current UI
    setWishlistItems((prev) =>
      prev.filter((item) => item.id !== product.id)
    );

    // 4. Go to cart page
    router.push("/cart");
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
  }
};


  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const totalItems = wishlistItems.length;

  const totalPrice = wishlistItems.reduce(
    (total, item) => total + item.price,
    0
  );

  const totalRegularPrice = wishlistItems.reduce(
    (total, item) =>
      total + (item.originalPrice ?? item.price),
    0
  );

  const totalSave = Math.max(
    totalRegularPrice - totalPrice,
    0
  );

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFA] font-['Poppins']">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex min-h-100 items-center justify-center rounded-xl border border-[#E5EEEE] bg-white">
            <p className="text-[14px] text-[#64748B]">
              Loading wishlist...
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F8FAFA] font-['Poppins']">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">

          {/* =================================================
              WISHLIST PRODUCTS
          ================================================= */}

          <div className="space-y-3">

            {/* =========================
                EMPTY STATE
            ========================= */}

            {wishlistItems.length === 0 ? (
              <div className="flex min-h-87.5 flex-col items-center justify-center rounded-xl border border-[#E5EEEE] bg-white px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F8FAFA]">
                  <Heart
                    size={30}
                    className="text-[#94A3B8]"
                  />
                </div>

                <h2 className="text-[18px] font-semibold text-[#172033]">
                  Your wishlist is empty
                </h2>

                <p className="mt-2 text-[14px] text-[#64748B]">
                  Start saving products you love.
                </p>

                <Link
                  href="/shop"
                  className="mt-5 rounded-lg bg-[#0F766E] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#0B625B]"
                >
                  Explore Products
                </Link>
              </div>
            ) : (
              <>
                {/* =========================
                    WISHLIST ITEMS
                ========================= */}

                {wishlistItems.map((product) => {
                  const hasDiscount =
                    product.originalPrice !== undefined &&
                    product.originalPrice > product.price;

                  const discountPercentage = hasDiscount
                    ? Math.round(
                        ((product.originalPrice! -
                          product.price) /
                          product.originalPrice!) *
                          100
                      )
                    : 0;

                  return (
                    <article
                      key={product.wishlistId}
                      className="relative flex min-h-29.5 gap-4 rounded-xl border border-[#E5EEEE] bg-white p-3 shadow-sm transition hover:shadow-md"
                    >
                      {/* =========================
                          CHECKBOX
                      ========================= */}

                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer rounded border-[#CBD5E1] accent-[#0F766E]"
                        />
                      </div>

                      {/* =========================
                          IMAGE
                      ========================= */}

                      <div className="relative h-23 w-23 shrink-0 overflow-hidden rounded-lg bg-[#F1F5F5]">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="92px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Heart
                              size={28}
                              className="text-[#CBD5E1]"
                            />
                          </div>
                        )}
                      </div>

                      {/* =========================
                          PRODUCT DETAILS
                      ========================= */}

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[14px] font-semibold text-[#172033]">
                          {product.name}
                        </h2>

                        <p className="mt-1 text-[11px] text-[#64748B]">
                          {product.category}
                        </p>

                        {/* Stock */}

                        <span
                          className={`mt-2 inline-flex rounded-sm px-2 py-0.5 text-[10px] font-medium ${
                            product.inStock
                              ? "bg-[#E8F7F3] text-[#0F766E]"
                              : "bg-[#FEE2E2] text-[#DC2626]"
                          }`}
                        >
                          {product.inStock
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>

                      {/* =========================
                          PRICE
                      ========================= */}

                      <div className="flex min-w-30 flex-col items-start justify-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[16px] font-bold text-[#172033]">
                            ${product.price.toFixed(2)}
                          </span>

                          {hasDiscount && (
                            <span className="text-[10px] text-[#94A3B8] line-through">
                              $
                              {product.originalPrice!.toFixed(
                                2
                              )}
                            </span>
                          )}
                        </div>

                        {hasDiscount && (
                          <span className="mt-1 rounded bg-[#FFF1F1] px-2 py-0.5 text-[10px] font-semibold text-[#FF6B6B]">
                            {discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      {/* =========================
                          ACTIONS
                      ========================= */}

                      <div className="flex min-w-40 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart(product)
                          }
                          disabled={!product.inStock}
                          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#FF6B6B] px-4 text-[12px] font-semibold text-white transition hover:bg-[#f05252] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShoppingCart size={14} />

                          Add to Cart
                        </button>

                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex h-9 items-center rounded-md border border-[#0F766E] px-3 text-[12px] font-medium text-[#0F766E] transition hover:bg-[#E8F7F3]"
                        >
                          View Details
                        </Link>
                      </div>

                      {/* =========================
                          REMOVE
                      ========================= */}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(product.id)
                        }
                        disabled={
                          removingId === product.id
                        }
                        aria-label={`Remove ${product.name}`}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[#FF6B6B] transition hover:bg-[#FFF1F1] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removingId === product.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FF6B6B] border-t-transparent" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </article>
                  );
                })}

                {/* =========================
                    CLEAR ALL
                ========================= */}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isClearing}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#FF6B6B] px-4 py-2 text-[12px] font-medium text-[#FF6B6B] transition hover:bg-[#FFF1F1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={13} />

                    {isClearing
                      ? "Clearing..."
                      : "Clear All"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-4">

            {/* =========================
                WISHLIST SUMMARY
            ========================= */}

            <div className="rounded-xl border border-[#E5EEEE] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Heart
                  size={16}
                  className="fill-[#0F766E] text-[#0F766E]"
                />

                <h2 className="text-[14px] font-semibold text-[#172033]">
                  Wishlist Summary
                </h2>
              </div>

              <div className="space-y-3">

                {/* Total Items */}

                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#64748B]">
                    Total Items
                  </span>

                  <span className="font-semibold text-[#172033]">
                    {totalItems}
                  </span>
                </div>

                {/* Total Price */}

                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#64748B]">
                    Total Price
                  </span>

                  <span className="font-semibold text-[#172033]">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* You Save */}

                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#64748B]">
                    You Save
                  </span>

                  <span className="font-semibold text-[#0F766E]">
                    ${totalSave.toFixed(2)}
                  </span>
                </div>
              </div>

    
            </div>

            {/* =========================
                SPECIAL FOR YOU
            ========================= */}

            <div className="rounded-xl border border-[#E5EEEE] bg-[#F0FAF8] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F766E]">
                  <Tag
                    size={17}
                    className="text-white"
                  />
                </div>

                <div>
                  <h3 className="text-[13px] font-semibold text-[#0F766E]">
                    Special For You
                  </h3>

                  <p className="mt-1 text-[11px] leading-4 text-[#64748B]">
                    Items in your wishlist might go on
                    sale. Dont miss out!
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default WishlistPage;