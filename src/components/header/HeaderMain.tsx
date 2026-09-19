"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Heart,
  Search,
  ShoppingCart,
  UserRound,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Package,
  Ticket,
  MapPin,
  Settings,
  Boxes,
  ShoppingBag,
  Warehouse,
  Users,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { apiGet } from "@/lib/core/server";
import { getWishlist } from "@/lib/api/wishlist";

interface SearchProduct {
  id: string;
  name: string;
  sku: string;
  regularPrice: number;
  salePrice: number | null;
  images: string[];
}

interface SearchProductsResponse {
  success: boolean;
  message: string;
  data: SearchProduct[];
}

interface HeaderMainProps {
  onMenuOpen: () => void;
  categoryOpen: boolean;
  onCategoryToggle: () => void;
}

const HeaderMain = ({ onMenuOpen }: HeaderMainProps) => {
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const router = useRouter();

  // Better Auth Session
  // IMPORTANT: user must be initialized before wishlist useEffect
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // =====================================================
  // CART COUNT
  // =====================================================
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("shopora-cart");

      if (!savedCart) {
        setCartCount(0);
        return;
      }

      try {
        const cart = JSON.parse(savedCart);

        const totalQuantity = cart.reduce(
          (total: number, item: { quantity: number }) =>
            total + item.quantity,
          0,
        );

        setCartCount(totalQuantity);
      } catch (error) {
        console.error("CART COUNT ERROR:", error);
        setCartCount(0);
      }
    };

    // Initial count
    updateCartCount();

    // Listen for cart changes
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  // =====================================================
  // WISHLIST COUNT
  // =====================================================
  useEffect(() => {
    const updateWishlistCount = async () => {
      if (!user?.id) {
        setWishlistCount(0);
        return;
      }

      try {
        const wishlist = await getWishlist(user.id);
        setWishlistCount(wishlist.length);
      } catch (error) {
        console.error("WISHLIST COUNT ERROR:", error);
        setWishlistCount(0);
      }
    };

    updateWishlistCount();

    window.addEventListener(
      "wishlist-updated",
      updateWishlistCount,
    );

    return () => {
      window.removeEventListener(
        "wishlist-updated",
        updateWishlistCount,
      );
    };
  }, [user?.id]);

  // =====================================================
  // LIVE SEARCH
  // =====================================================
  useEffect(() => {
    const query = search.trim();

    const timer = setTimeout(async () => {
      if (!query) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);

        const response = await apiGet<SearchProductsResponse>(
          `/api/v1/products/search?q=${encodeURIComponent(query)}`,
        );

        // console.log("LIVE SEARCH RESULT:", response.data);

        setSearchResults(response.data || []);
      } catch (error) {
        console.error("LIVE SEARCH ERROR:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const dashboardPath =
    user?.role === "Seller"
      ? "/dashboard/seller"
      : user?.role === "Admin"
        ? "/dashboard/admin"
        : "/dashboard/customer";

  // =====================================================
  // SEARCH HANDLER
  // =====================================================
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) return;

    router.push(
      `/products/search?q=${encodeURIComponent(query)}`,
    );

    setSearch("");
  };

  return (
    <>
      {/* =====================================================
          DESKTOP MAIN HEADER
      ====================================================== */}
      <div className="hidden lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-7 px-4 py-5">
          {/* =================================================
              LOGO
          ================================================== */}
          <Link
            href="/"
            className="flex w-43.75 shrink-0 items-center gap-2.5"
          >
            <div className="relative flex h-12 w-10 items-end justify-center rounded-lg bg-[#0F766E] shadow-sm">
              {/* Bag Handle */}
              <div className="absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-t-full border-[3px] border-b-0 border-[#0F766E]" />

              <span className="mb-1 font-['Poppins'] text-3xl font-bold leading-none text-[#FF6B6B]">
                S
              </span>
            </div>

            <div>
              <h1 className="font-['Poppins'] text-xl font-bold leading-5 text-[#1E293B]">
                Shopora
              </h1>

              <p className="mt-0.5 font-['Poppins'] text-[7px] text-[#94A3B8]">
                Smart Shopping, Made Simple
              </p>
            </div>
          </Link>

          {/* =================================================
              DESKTOP SEARCH
          ================================================== */}
          <form
            onSubmit={handleSearch}
            className="relative flex h-11 flex-1 rounded-lg border border-[#E2E8F0] bg-white"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="min-w-0 flex-1 bg-transparent px-4 font-['Poppins'] text-[14px] text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
            />

            {search.trim() &&
              (searchResults.length > 0 || searchLoading) && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#E5EEEE] bg-white shadow-lg">
                  {searchLoading ? (
                    <div className="px-4 py-4 text-sm text-[#64748B]">
                      Searching...
                    </div>
                  ) : (
                    <div className="max-h-90 overflow-y-auto">
                      {searchResults
                        .slice(0, 5)
                        .map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setSearchResults([]);
                              router.push(
                                `/products/${product.id}`,
                              );
                            }}
                            className="flex w-full items-center gap-3 border-b border-[#F0F4F4] px-4 py-3 text-left transition hover:bg-[#F8FAFA]"
                          >
                            {/* Product Image */}
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#F8FAFA]">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-[#94A3B8]">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-[#1E293B]">
                                {product.name}
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                {product.salePrice !== null ? (
                                  <>
                                    <span className="text-sm font-semibold text-[#0F766E]">
                                      ${product.salePrice}
                                    </span>

                                    <span className="text-xs text-[#94A3B8] line-through">
                                      ${product.regularPrice}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-semibold text-[#0F766E]">
                                    ${product.regularPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

            {/* Search Button */}
            <button
              type="submit"
              aria-label="Search"
              className="flex w-11 items-center justify-center bg-[#0F766E] text-white transition-colors duration-300 hover:bg-[#0B625B]"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>
          </form>

          {/* =================================================
              ACTIONS
          ================================================== */}
          <div className="flex shrink-0 items-center gap-5">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="group flex flex-col items-center gap-1"
            >
              <div className="relative">
                <Heart
                  size={22}
                  strokeWidth={1.6}
                  className="text-[#475569] transition-colors group-hover:text-[#0F766E]"
                />

                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B6B] font-['Poppins'] text-[11px] font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </div>

              <span className="font-['Poppins'] text-[14px] font-medium text-[#475569]">
                Wishlist
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="group relative flex flex-col items-center gap-1"
            >
              <div className="relative">
                <ShoppingCart
                  size={22}
                  strokeWidth={1.6}
                  className="text-[#475569] transition-colors group-hover:text-[#0F766E]"
                />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B6B] font-['Poppins'] text-[11px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </div>

              <span className="font-['Poppins'] text-[14px] font-medium text-[#475569]">
                Cart
              </span>
            </Link>

            {/* =================================================
                ACCOUNT
            ================================================== */}
            <div
              className="group relative"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              {/* Account Button */}
              <button
                type="button"
                onClick={() =>
                  setAccountOpen((prev) => !prev)
                }
                className=""
              >
                {user ? (
                  <>
                    {/* Avatar */}
                    <div className="flex cursor-pointer h-10 w-10 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-[#0F766E] bg-[#E8F5F3]">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          className="h-full w-full object-cover"
                          height={150}
                          width={150}
                        />
                      ) : (
                        <UserRound
                          size={30}
                          strokeWidth={1.7}
                          className="text-[#0F766E]"
                        />
                      )}
                    </div>

                    {/* User Name */}
                    <div className="hidden text-left xl:block cursor-pointer">
                      <p className="font-['Poppins'] text-[14px] font-semibold leading-5 text-[#1E293B]">
                        {user.name || "User"}
                      </p>

                      <p className="font-['Poppins'] text-[11px] text-[#64748B]">
                        My Account
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Logged Out */}
                    <UserRound
                      size={22}
                      strokeWidth={1.6}
                      className="text-[#475569] cursor-pointer transition-colors group-hover:text-[#0F766E]"
                    />

                    <span className="font-['Poppins'] text-[14px] font-medium text-[#475569]">
                      My Account
                    </span>
                  </>
                )}
              </button>

              {/* =================================================
                  ACCOUNT DROPDOWN
              ================================================== */}
              <div
                className={`absolute right-0 top-full z-50 mt-4 w-80 rounded-xl border border-[#E8EEEE] bg-white p-3 shadow-[0_10px_35px_rgba(15,118,110,0.12)] transition-all duration-200 ${
                  accountOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-2 opacity-0"
                }`}
              >
                {user ? (
                  <>
                    {/* Logged In Header */}
                    <div className="border-b border-[#E8EEEE] px-3 pb-3">
                      <p className="font-['Poppins'] text-sm text-[#475569]">
                        Welcome back,
                      </p>

                      <p className="mt-1 font-['Poppins'] text-lg font-semibold text-[#0F766E]">
                        {user.name || "User"}
                      </p>
                    </div>

                    {/* Dashboard */}
                    <Link
                      href={dashboardPath}
                      className="mt-2 flex w-full items-center gap-3 rounded-lg bg-[#E8F5F3] px-3 py-3 font-['Poppins'] text-sm font-medium text-[#1E293B] transition-colors hover:bg-[#D9EFEC]"
                    >
                      <LayoutDashboard
                        size={19}
                        strokeWidth={1.7}
                        className="text-[#0F766E]"
                      />
                      Dashboard
                    </Link>

                    {user.role === "Seller" ? (
                      <>
                        {/* All Products */}
                        <Link
                          href="/dashboard/seller/products"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <Boxes size={19} strokeWidth={1.7} />
                          All Products
                        </Link>

                        {/* Orders */}
                        <Link
                          href="/dashboard/seller/orders"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <ShoppingBag
                            size={19}
                            strokeWidth={1.7}
                          />
                          Orders
                        </Link>

                        {/* Inventory */}
                        <Link
                          href="/dashboard/seller/inventory"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <Warehouse
                            size={19}
                            strokeWidth={1.7}
                          />
                          Inventory
                        </Link>

                        {/* Coupons */}
                        <Link
                          href="/dashboard/seller/coupons"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <Ticket
                            size={19}
                            strokeWidth={1.7}
                          />
                          Coupons
                        </Link>
                      </>
                    ) : user.role === "Admin" ? (
                      <>
                        {/* Users List */}
                        <Link
                          href="/dashboard/admin/customers"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <Users size={19} strokeWidth={1.7} />
                          Users List
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* Orders */}
                        <Link
                          href={`${dashboardPath}/my-order`}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <Package
                            size={19}
                            strokeWidth={1.7}
                          />
                          My Orders
                        </Link>

                        {/* Wishlist */}
                        <Link
                          href={`${dashboardPath}/wishlist`}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <Heart
                            size={19}
                            strokeWidth={1.7}
                          />
                          My Wishlist
                        </Link>

                        {/* Coupons */}
                        <Link
                          href={`${dashboardPath}/coupons`}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <Ticket
                            size={19}
                            strokeWidth={1.7}
                          />
                          My Coupons
                        </Link>

                        {/* Addresses */}
                        <Link
                          href={`${dashboardPath}/addresses`}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                        >
                          <MapPin
                            size={19}
                            strokeWidth={1.7}
                          />
                          Addresses
                        </Link>
                      </>
                    )}

                    {/* Account Settings */}
                    <Link
                      href={
                        user.role === "Admin"
                          ? "/dashboard/admin/settings"
                          : "/dashboard/settings"
                      }
                      onClick={() => setAccountOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] transition-colors hover:bg-[#F6FAF9]"
                    >
                      <Settings
                        size={19}
                        strokeWidth={1.7}
                      />
                      Account Settings
                    </Link>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={async () => {
                        await authClient.signOut();
                        setAccountOpen(false);
                      }}
                      className="mt-1 cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm font-medium text-[#FF6B6B] transition-colors hover:bg-[#FFF1F1]"
                    >
                      <LogOut
                        size={19}
                        strokeWidth={1.7}
                      />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Logged Out Header */}
                    <div className="border-b border-[#E8EEEE] px-3 pb-3">
                      <p className="font-['Poppins'] text-sm font-medium text-[#1E293B]">
                        Welcome to Shopora
                      </p>

                      <p className="mt-1 font-['Poppins'] text-xs leading-5 text-[#64748B]">
                        Sign in or create an account to continue.
                      </p>
                    </div>

                    {/* Login */}
                    <Link
                      href="/auth/login"
                      onClick={() => setAccountOpen(false)}
                      className="mt-3 flex w-full items-center gap-3 rounded-lg bg-[#0F766E] px-3 py-3 font-['Poppins'] text-sm font-medium text-white transition-colors hover:bg-[#0B625B]"
                    >
                      <LogIn
                        size={19}
                        strokeWidth={1.7}
                      />
                      Login
                    </Link>

                    {/* Register */}
                    <Link
                      href="/auth/register"
                      onClick={() => setAccountOpen(false)}
                      className="mt-2 flex w-full items-center gap-3 rounded-lg border border-[#0F766E] px-3 py-3 font-['Poppins'] text-sm font-medium text-[#0F766E] transition-colors hover:bg-[#E8F5F3]"
                    >
                      <UserPlus
                        size={19}
                        strokeWidth={1.7}
                      />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE MAIN HEADER
      ====================================================== */}
      <div className="lg:hidden">
        <div className="flex h-15.5 items-center justify-between border-b border-[#E8EEEE] px-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            {/* Menu */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={onMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-[#F6FAF9] hover:text-[#0F766E]"
            >
              <span className="text-xl leading-none">
                ☰
              </span>
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2"
            >
              <div className="relative flex h-9 w-8 items-end justify-center rounded-md bg-[#0F766E]">
                <div className="absolute -top-1.5 left-1/2 h-3.5 w-4 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-[#0F766E]" />

                <span className="mb-0.5 font-['Poppins'] text-xl font-bold leading-none text-[#FF6B6B]">
                  S
                </span>
              </div>

              <div>
                <h1 className="font-['Poppins'] text-base font-bold leading-4 text-[#1E293B]">
                  Shopora
                </h1>

                <p className="font-['Poppins'] text-[5px] text-[#94A3B8]">
                  Smart Shopping, Made Simple
                </p>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative text-[#475569]"
            >
              <Heart size={20} strokeWidth={1.7} />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B6B] font-['Poppins'] text-[7px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-[#475569]"
            >
              <ShoppingCart
                size={20}
                strokeWidth={1.7}
              />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B6B] font-['Poppins'] text-[7px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* =================================================
                MOBILE ACCOUNT
            ================================================== */}
            <div className="relative">
              <button
                type="button"
                aria-label="Account"
                onClick={() =>
                  setAccountOpen((prev) => !prev)
                }
                className="flex items-center gap-1 text-[#475569]"
              >
                {user ? (
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#0F766E] bg-[#E8F5F3]">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover"
                        height={150}
                        width={150}
                      />
                    ) : (
                      <UserRound
                        size={17}
                        strokeWidth={1.7}
                        className="text-[#0F766E]"
                      />
                    )}
                  </div>
                ) : (
                  <UserRound
                    size={20}
                    strokeWidth={1.7}
                  />
                )}

                <ChevronDown
                  size={13}
                  strokeWidth={1.8}
                  className={`transition-transform duration-200 ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mobile Account Dropdown */}
              <div
                className={`absolute right-0 top-full z-50 mt-3 w-72 rounded-xl border border-[#E8EEEE] bg-white p-3 shadow-[0_10px_35px_rgba(15,118,110,0.12)] transition-all duration-200 ${
                  accountOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-2 opacity-0"
                }`}
              >
                {user ? (
                  <>
                    {/* User */}
                    <div className="border-b border-[#E8EEEE] px-3 pb-3">
                      <p className="font-['Poppins'] text-xs text-[#475569]">
                        Welcome back,
                      </p>

                      <p className="mt-1 font-['Poppins'] text-base font-semibold text-[#0F766E]">
                        {user.name || "User"}
                      </p>
                    </div>

                    {/* Dashboard */}
                    <Link
                      href={dashboardPath}
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="mt-2 flex items-center gap-3 rounded-lg bg-[#E8F5F3] px-3 py-3 font-['Poppins'] text-sm font-medium text-[#1E293B]"
                    >
                      <LayoutDashboard
                        size={18}
                        className="text-[#0F766E]"
                      />
                      Dashboard
                    </Link>

                    {/* Orders */}
                    <Link
                      href="/orders"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] hover:bg-[#F6FAF9]"
                    >
                      <Package size={18} />
                      My Orders
                    </Link>

                    {/* Wishlist */}
                    <Link
                      href="/wishlist"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] hover:bg-[#F6FAF9]"
                    >
                      <Heart size={18} />
                      My Wishlist
                    </Link>

                    {/* Settings */}
                    <Link
                      href={
                        user.role === "Admin"
                          ? "/dashboard/admin/settings"
                          : "/dashboard/settings"
                      }
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm text-[#334155] hover:bg-[#F6FAF9]"
                    >
                      <Settings size={18} />
                      Account Settings
                    </Link>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={async () => {
                        await authClient.signOut();
                        setAccountOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 font-['Poppins'] text-sm font-medium text-[#FF6B6B] hover:bg-[#FFF1F1]"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Welcome */}
                    <div className="border-b border-[#E8EEEE] px-3 pb-3">
                      <p className="font-['Poppins'] text-sm font-medium text-[#1E293B]">
                        Welcome to Shopora
                      </p>

                      <p className="mt-1 font-['Poppins'] text-xs leading-5 text-[#64748B]">
                        Sign in or create an account to continue.
                      </p>
                    </div>

                    {/* Login */}
                    <Link
                      href="/auth/login"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="mt-3 flex items-center gap-3 rounded-lg bg-[#0F766E] px-3 py-3 font-['Poppins'] text-sm font-medium text-white"
                    >
                      <LogIn size={18} />
                      Login
                    </Link>

                    {/* Register */}
                    <Link
                      href="/auth/register"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="mt-2 flex items-center gap-3 rounded-lg border border-[#0F766E] px-3 py-3 font-['Poppins'] text-sm font-medium text-[#0F766E]"
                    >
                      <UserPlus size={18} />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
             MOBILE SEARCH
          ================================================== */}
        <div className="border-b border-[#E8EEEE] px-4 py-3">
          <form
            onSubmit={handleSearch}
            className="relative flex h-10 overflow-visible rounded-lg border border-[#E2E8F0]"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands and more..."
              className="min-w-0 flex-1 bg-transparent px-3 font-['Poppins'] text-[14px] text-[#1E293B] outline-none placeholder:text-[#94A3B8]"
            />

            {/* Mobile Search Suggestions */}
            {search.trim() &&
              (searchResults.length > 0 ||
                searchLoading) && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#E5EEEE] bg-white shadow-lg">
                  {searchLoading ? (
                    <div className="px-4 py-4 font-['Poppins'] text-[14px] text-[#64748B]">
                      Searching...
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults
                        .slice(0, 5)
                        .map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setSearchResults([]);
                              router.push(
                                `/products/${product.id}`,
                              );
                            }}
                            className="flex w-full items-center gap-3 border-b border-[#F0F4F4] px-3 py-3 text-left transition hover:bg-[#F8FAFA]"
                          >
                            {/* Product Image */}
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#F8FAFA]">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-['Poppins'] text-[14px] text-[#94A3B8]">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-['Poppins'] text-[14px] font-medium text-[#1E293B]">
                                {product.name}
                              </p>

                              <div className="mt-1 flex items-center gap-2">
                                {product.salePrice !==
                                null ? (
                                  <>
                                    <span className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]">
                                      ${product.salePrice}
                                    </span>

                                    <span className="font-['Poppins'] text-[14px] text-[#94A3B8] line-through">
                                      ${product.regularPrice}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-['Poppins'] text-[14px] font-semibold text-[#0F766E]">
                                    ${product.regularPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

            {/* Search Button */}
            <button
              type="submit"
              aria-label="Search"
              className="flex w-10 shrink-0 items-center justify-center bg-[#0F766E] text-white"
            >
              <Search
                size={17}
                strokeWidth={1.8}
              />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default HeaderMain;