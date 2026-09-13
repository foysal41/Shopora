"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  inStock: boolean;
  brand?: string;
  variant?: string;
};

const SHIPPING_FEE = 10;
const FREE_SHIPPING_THRESHOLD = 50;

const CartPage = () => {
  const router = useRouter();

  /* =========================================================
     CART STATE
  ========================================================= */

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [selectedItems, setSelectedItems] = useState<string[]>(
    []
  );

  const [isHydrated, setIsHydrated] = useState(false);

  /* =========================================================
   LOAD CART FROM LOCAL STORAGE
========================================================= */

useEffect(() => {
  try {
    const savedCart = localStorage.getItem("shopora-cart");

    if (savedCart) {
      const parsedCart: CartItem[] = JSON.parse(savedCart);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartItems(parsedCart);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItems(
        parsedCart.map((item) => item.id)
      );
    }
  } catch (error) {
    console.error("FAILED TO LOAD CART:", error);
  } finally {

    setIsHydrated(true);
  }
}, []);

  /* =========================================================
     SAVE CART TO LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
  if (!isHydrated) return;

  try {
    localStorage.setItem(
      "shopora-cart",
      JSON.stringify(cartItems)
    );

    // Notify Header that cart has changed
    window.dispatchEvent(new Event("cart-updated"));
  } catch (error) {
    console.error("FAILED TO SAVE CART:", error);
  }
}, [cartItems, isHydrated]);

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const isAllSelected =
    cartItems.length > 0 &&
    selectedItems.length === cartItems.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        cartItems.map((item) => item.id)
      );
    }
  };

  /* =========================================================
     SELECT SINGLE ITEM
  ========================================================= */

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter(
          (itemId) => itemId !== id
        );
      }

      return [...prev, id];
    });
  };

  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

  const increaseQuantity = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  /* =========================================================
     DECREASE QUANTITY
  ========================================================= */

  const decreaseQuantity = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity - 1
              ),
            }
          : item
      )
    );
  };

  /* =========================================================
     REMOVE SINGLE ITEM
  ========================================================= */

  const removeItem = (id: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setSelectedItems((prev) =>
      prev.filter(
        (itemId) => itemId !== id
      )
    );
  };

  /* =========================================================
     REMOVE SELECTED ITEMS
  ========================================================= */

  const removeSelected = () => {
    if (selectedItems.length === 0) return;

    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !selectedItems.includes(item.id)
      )
    );

    setSelectedItems([]);
  };

  /* =========================================================
     CLEAR CART
  ========================================================= */

 const clearCart = () => {
  setCartItems([]);
  setSelectedItems([]);

  localStorage.removeItem("shopora-cart");

  // Notify Header
  window.dispatchEvent(new Event("cart-updated"));
};
  /* =========================================================
     SUBTOTAL
  ========================================================= */

  const subtotal = useMemo(() => {
    return cartItems
      .filter((item) =>
        selectedItems.includes(item.id)
      )
      .reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      );
  }, [cartItems, selectedItems]);

  /* =========================================================
     SHIPPING
  ========================================================= */

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : subtotal > 0
        ? SHIPPING_FEE
        : 0;

  /* =========================================================
     TOTAL
  ========================================================= */

  const total = subtotal + shipping;

  /* =========================================================
     CHECKOUT
  ========================================================= */

const handleCheckout = () => {
  if (selectedItems.length === 0) {
    alert("Please select at least one product.");
    return;
  }

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  localStorage.setItem(
    "shopora-checkout",
    JSON.stringify({
      items: selectedCartItems,
      subtotal,
      shipping,
      total,
    })
  );

  const firstItem = selectedCartItems[0];

  router.push(
    `/checkout/${firstItem.id}?quantity=${firstItem.quantity}&fromCart=true`
  );
};

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F8FAFA] font-['Poppins']">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            EMPTY CART
        =================================================== */}

        {cartItems.length === 0 ? (
          <div className="flex min-h-[450px] flex-col items-center justify-center rounded-xl border border-[#E5EEEE] bg-white px-6 text-center shadow-sm">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF8F5]">
              <ShoppingCart
                size={36}
                className="text-[#0F766E]"
              />
            </div>

            <h2 className="text-[22px] font-semibold text-[#1E293B]">
              Your cart is empty
            </h2>

            <p className="mt-2 max-w-md text-[14px] leading-6 text-[#64748B]">
              You have not added any products
              to your cart yet. Start shopping
              and add products you love.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#0F766E] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#0B625B]"
            >
              Continue Shopping

              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="overflow-hidden rounded-lg border border-[#E5EEEE] bg-white shadow-sm">

              {/* Select All */}

              <div className="flex items-center border-b border-[#E5EEEE] px-4 py-4">
                <label className="flex cursor-pointer items-center gap-3 text-[14px] text-[#64748B]">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 cursor-pointer accent-[#0F766E]"
                  />

                  <span>Select All</span>
                </label>
              </div>

              {/* Column Header */}

              <div className="hidden grid-cols-[34px_minmax(220px,1fr)_90px_130px_90px_45px] items-center gap-3 border-b border-[#E5EEEE] bg-[#FCFDFD] px-4 py-3 text-[14px] font-medium text-[#64748B] md:grid">

                <div />

                <div>Product</div>

                <div>Price</div>

                <div>Quantity</div>

                <div>Total</div>

                <div>Action</div>

              </div>

              {/* Cart Items */}

              <div>
                {cartItems.map((item) => {
                  const itemTotal =
                    item.price *
                    item.quantity;

                  const isSelected =
                    selectedItems.includes(
                      item.id
                    );

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-4 border-b border-[#E5EEEE] px-4 py-5 md:grid-cols-[34px_minmax(220px,1fr)_90px_130px_90px_45px] md:items-center md:gap-3"
                    >

                      {/* Checkbox */}

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleSelectItem(
                              item.id
                            )
                          }
                          className="h-4 w-4 cursor-pointer accent-[#0F766E]"
                        />
                      </div>

                      {/* Product */}

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[#F1F5F5]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="68px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0">

                          <h2 className="truncate text-[14px] font-semibold text-[#1E293B]">
                            {item.name}
                          </h2>

                          {(item.brand ||
                            item.variant) && (
                            <p className="mt-1 text-[14px] text-[#64748B]">

                              {item.brand}

                              {item.brand &&
                                item.variant && (
                                  <span className="mx-1 text-[#CBD5E1]">
                                    |
                                  </span>
                                )}

                              {item.variant}

                            </p>
                          )}

                          {item.inStock && (
                            <span className="mt-2 inline-flex rounded-md bg-[#E8F7F3] px-2.5 py-1 text-[14px] font-medium text-[#0F766E]">
                              In Stock
                            </span>
                          )}

                        </div>
                      </div>

                      {/* Price */}

                      <div>
                        <span className="text-[14px] font-semibold text-[#1E293B]">
                          $
                          {item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity */}

                      <div>
                        <div className="inline-flex h-9 items-center overflow-hidden rounded-md border border-[#DDE5E5]">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                            disabled={
                              item.quantity <=
                              1
                            }
                            className="flex h-9 w-9 items-center justify-center text-[#64748B] transition hover:bg-[#F8FAFA] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="flex h-9 min-w-9 items-center justify-center border-x border-[#DDE5E5] px-2 text-[14px] font-medium text-[#1E293B]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-[#64748B] transition hover:bg-[#F8FAFA]"
                          >
                            <Plus size={15} />
                          </button>

                        </div>
                      </div>

                      {/* Total */}

                      <div>
                        <span className="text-[14px] font-semibold text-[#1E293B]">
                          $
                          {itemTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Remove */}

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          aria-label={`Remove ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FFB4B4] text-[#FF6B6B] transition hover:bg-[#FFF3F3]"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}

              <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                <button
                  type="button"
                  onClick={removeSelected}
                  disabled={
                    selectedItems.length ===
                    0
                  }
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-[#FFB4B4] px-4 py-2.5 text-[14px] font-medium text-[#FF6B6B] transition hover:bg-[#FFF3F3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={15} />

                  Remove Selected
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex w-fit items-center gap-2 text-[14px] font-medium text-[#FF6B6B] transition hover:text-[#E54848]"
                >
                  <Trash2 size={15} />

                  Clear Cart
                </button>

              </div>
            </div>

            {/* =================================================
                RIGHT SIDE - ORDER SUMMARY
            ================================================= */}

            <aside className="h-fit rounded-lg border border-[#E5EEEE] bg-white p-5 shadow-sm">

              <h2 className="text-[17px] font-semibold text-[#1E293B]">
                Order Summary
              </h2>

              {/* Subtotal */}

              <div className="mt-5 flex items-center justify-between text-[14px]">

                <span className="text-[#64748B]">
                  Subtotal (
                  {selectedItems.length}{" "}
                  {selectedItems.length ===
                  1
                    ? "item"
                    : "items"}
                  )
                </span>

                <span className="font-semibold text-[#1E293B]">
                  $
                  {subtotal.toFixed(2)}
                </span>

              </div>

              {/* Shipping */}

              <div className="mt-4 flex items-start justify-between text-[14px]">

                <div>

                  <p className="text-[#64748B]">
                    Shipping
                  </p>

                  <p className="mt-1 text-[14px] text-[#94A3B8]">
                    Standard Delivery
                    (3-5 days)
                  </p>

                </div>

                <div className="text-right">

                  {shipping === 0 ? (
                    <span className="font-semibold text-[#0F766E]">
                      Free
                    </span>
                  ) : (
                    <span className="font-semibold text-[#1E293B]">
                      $
                      {shipping.toFixed(2)}
                    </span>
                  )}

                  <button
                    type="button"
                    className="mt-1 block text-[14px] text-[#0F766E] hover:underline"
                  >
                    Change
                  </button>

                </div>
              </div>

              {/* Divider */}

              <div className="my-5 border-t border-[#E5EEEE]" />

              {/* Total */}

              <div className="flex items-center justify-between">

                <span className="text-[16px] font-semibold text-[#1E293B]">
                  Total
                </span>

                <span className="text-[19px] font-bold text-[#1E293B]">
                  ${total.toFixed(2)}
                </span>

              </div>

              {/* Checkout */}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  selectedItems.length ===
                  0
                }
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#FF6B6B] px-4 text-[14px] font-semibold text-white transition hover:bg-[#F25555] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to Checkout
              </button>

              {/* Free Shipping */}

              <div className="mt-4 rounded-md bg-[#EAF8F5] px-3 py-3.5">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                    <Truck
                      size={18}
                      className="text-[#0F766E]"
                    />
                  </div>

                  <div>

                    <p className="text-[14px] font-semibold text-[#0F766E]">
                      {subtotal >=
                      FREE_SHIPPING_THRESHOLD
                        ? "Free Shipping on Your Order"
                        : "Free Shipping on Orders Over $50"}
                    </p>

                    <p className="mt-1 text-[14px] leading-5 text-[#64748B]">
                      {subtotal >=
                      FREE_SHIPPING_THRESHOLD
                        ? "You are eligible for free shipping!"
                        : `Add $${(
                            FREE_SHIPPING_THRESHOLD -
                            subtotal
                          ).toFixed(
                            2
                          )} more for free shipping.`}
                    </p>

                  </div>

                </div>
              </div>

            </aside>
          </div>
        )}
      </section>
    </main>
  );
};

export default CartPage;