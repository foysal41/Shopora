"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  ShoppingCart,
  Zap,
  CheckCircle2,
  Star,
} from "lucide-react";
import { homePageSingleProduct } from "@/type/homePage";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { addToWishlist, checkWishlist} from "@/lib/api/wishlist";

import { addToCart } from "@/lib/cart";
import { toast } from "react-toastify";



const SingleProduct = () => {
  const params = useParams();
const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const productId = params.id as string;

  const [product, setProduct] = useState<homePageSingleProduct | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);



 

  /* =========================================================
     FETCH PRODUCT BY ID
  ========================================================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const response = await fetch(
          `${API_URL}/api/v1/products/${productId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result = await response.json();        

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch product"
          );
        }

        setProduct(result.data);
      } catch (err) {
        console.error("PRODUCT FETCH ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);


  /* =========================================================
     CHECK IF ALREADY IN WISHLIST
  ========================================================= */

  useEffect(() => {
    const check = async () => {
      if (!userId || !productId) return;

      try {
        const wishlisted = await checkWishlist(userId, productId);
        setIsWishlisted(wishlisted);
      } catch (err) {
        console.error("WISHLIST CHECK ERROR:", err);
      }
    };

    check();
  }, [userId, productId]);

  /* =========================================================
     ADD TO WISHLIST
  ========================================================= */

  const handleAddToWishlist = async () => {
    if (!userId) {
      toast.error("Please log in to save items to your wishlist");
      router.push("/auth/login");
      return;
    }

    if (isWishlisted) {
      toast("This item is already in your wishlist");
      return;
    }

    try {
      setWishlistLoading(true);
      await addToWishlist(userId, productId);
      setIsWishlisted(true);
      toast.success("Added to your wishlist");
    } catch (err) {
      console.error("ADD TO WISHLIST ERROR:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add to wishlist"
      );
    } finally {
      setWishlistLoading(false);
    }
  };


    /* =========================================================
     ADD TO cart
  ========================================================= */

const handleAddToCart = () => {
  if (!product) {
    toast.error("Product not found");
    return;
  }

  if (product.stockQuantity <= 0) {
    toast.error("Product is out of stock");
    return;
  }

  addToCart({
    id: product.id,
    name: product.name,
    image: product.images?.[0] || null,
    price: price,
    quantity: quantity,
    inStock: product.stockQuantity > 0,
  });

  toast.success("Added to cart");
};

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFCFC] px-4">
        <p className="font-['Poppins'] text-lg text-[#64748B]">
          Loading product...
        </p>
      </main>
    );
  }

  

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFCFC] px-4">
        <p className="font-['Poppins'] text-lg text-red-500">
          {error || "Product not found"}
        </p>

        <Link
          href="/shop"
          className="rounded-lg bg-[#0F766E] px-6 py-3 font-['Poppins'] text-base font-medium text-white transition hover:bg-[#0B625B]"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  /* =========================================================
     PRICE
  ========================================================= */

  const price =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.regularPrice;

  const hasDiscount =
    product.salePrice &&
    product.salePrice > 0 &&
    product.salePrice < product.regularPrice;

  const discount = hasDiscount
    ? Math.round(
        ((product.regularPrice - product.salePrice!) /
          product.regularPrice) *
          100
      )
    : 0;

  const rating = product.rating ?? 0;
  const reviews = product.reviews ?? 0;

  /* =========================================================
     QUANTITY
  ========================================================= */

  const increaseQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };



  return (
    <main className="min-h-screen bg-[#FAFCFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="mb-6 flex flex-wrap items-center gap-2 font-['Poppins'] text-sm text-[#64748B]">
          <Link
            href="/"
            className="transition-colors hover:text-[#0F766E]"
          >
            Home
          </Link>

          <ChevronRight size={16} />

          <span>{product.category}</span>

          <ChevronRight size={16} />

          <span className="font-medium text-[#1E293B]">
            {product.name}
          </span>
        </div>

        {/* =====================================================
            MAIN PRODUCT AREA
        ===================================================== */}

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_1.1fr_0.8fr]">

          {/* ===================================================
              LEFT - IMAGES
          =================================================== */}

          <div className="flex gap-4">

            {/* Thumbnails */}

            <div className="flex w-16 shrink-0 flex-col gap-3">

              {product.images?.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border bg-white transition-all ${
                    selectedImage === index
                      ? "border-[#0F766E] ring-1 ring-[#0F766E]"
                      : "border-[#E2E8F0] hover:border-[#0F766E]"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </button>
              ))}

            </div>

            {/* Main Image */}

            <div className="relative flex min-h-107.5 flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">

              {product.images?.[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-8"
                />
              ) : (
                <div className="font-['Poppins'] text-base text-[#94A3B8]">
                  No Image Available
                </div>
              )}

            </div>
          </div>

          {/* ===================================================
              CENTER - PRODUCT INFORMATION
          =================================================== */}

          <div className="flex flex-col">

            {/* New Arrival */}

            <span className="mb-3 w-fit rounded-md bg-[#0F766E] px-2.5 py-1 font-['Poppins'] text-xs font-medium text-white">
              New Arrival
            </span>

            {/* Product Name */}

            <h1 className="font-['Poppins'] text-3xl font-semibold leading-tight text-[#1E293B] sm:text-4xl">
              {product.name}
            </h1>

            {/* Short Description */}

            <p className="mt-2 font-['Poppins'] text-base text-[#64748B]">
              {product.shortDescription ||
                "Premium quality product designed for everyday use."}
            </p>

            {/* Rating */}

            <div className="mt-3 flex flex-wrap items-center gap-2">

              <div className="flex items-center gap-0.5 text-[#FFB020]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={17}
                    fill={
                      star <= Math.round(rating)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>

              <span className="font-['Poppins'] text-sm font-medium text-[#475569]">
                {rating.toFixed(1)}
              </span>

              <span className="font-['Poppins'] text-sm text-[#94A3B8]">
                ({reviews} reviews)
              </span>
            </div>

            {/* Price */}

            <div className="mt-5 flex flex-wrap items-center gap-3">

              <span className="font-['Poppins'] text-3xl font-bold text-[#1E293B]">
                ${price.toFixed(2)}
              
              </span>

              {hasDiscount && (
                <>
                  <span className="font-['Poppins'] text-base text-[#94A3B8] line-through">
                    ${product.regularPrice.toFixed(2)}
                  </span>

                  <span className="rounded-md bg-[#FFF1F0] px-2 py-1 font-['Poppins'] text-sm font-semibold text-[#FF6B6B]">
                    {discount}% OFF
                  </span>
                </>
              )}

            </div>

      

            <div className="my-6 border-t border-[#E2E8F0]" />

            {/* Stock */}

            <div className="flex items-center justify-between">

              <span className="font-['Poppins'] text-base font-medium text-[#334155]">
                Availability
              </span>

              <span
                className={`font-['Poppins'] text-base font-semibold ${
                  product.stockQuantity > 0
                    ? "text-[#0F766E]"
                    : "text-red-500"
                }`}
              >
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} in stock`
                  : "Out of stock"}
              </span>

            </div>

            {/* Quantity */}

            <div className="mt-5">

              <p className="mb-2 font-['Poppins'] text-base font-medium text-[#334155]">
                Quantity
              </p>

              <div className="flex w-fit items-center rounded-lg border border-[#D9E2E2] bg-white">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="px-4 py-2 font-['Poppins'] text-lg text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                <span className="min-w-12 text-center font-['Poppins'] text-base font-medium text-[#1E293B]">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stockQuantity}
                  className="px-4 py-2 font-['Poppins'] text-lg text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>

              </div>
            </div>

            {/* Buttons */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#FF6B6B] px-5 py-3 font-['Poppins'] text-base font-semibold text-white transition-all hover:bg-[#F45B5B] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => router.push(`/checkout/${product.id}?quantity=${quantity}`)}
                disabled={product.stockQuantity <= 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-5 py-3 font-['Poppins'] text-base font-semibold text-white transition-all hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
              >
                <Zap size={19} />
                Buy Now
              </button>

            </div>

            {/* Wishlist */}

            <button
              type="button"
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
              className="mt-3 flex w-full items-center justify-center cursor-pointer gap-2 rounded-lg border border-[#D9E2E2] bg-white py-3 font-['Poppins'] text-base font-medium text-[#0F766E] transition-all hover:border-[#0F766E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Heart
                size={18}
                fill={isWishlisted ? "currentColor" : "none"}
              />
              {isWishlisted ? "Added to Wishlist" : "Add to Wishlist"}
            </button>

          </div>

          {/* ===================================================
              RIGHT - SERVICE INFORMATION
          =================================================== */}

          <div className="space-y-4">

            {/* Services */}

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">

              <div className="space-y-5">

                <div className="flex gap-4">
                  <Truck
                    size={22}
                    className="shrink-0 text-[#0F766E]"
                  />

                  <div>
                    <h3 className="font-['Poppins'] text-base font-semibold text-[#1E293B]">
                      Free Shipping
                    </h3>

                    <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                      On orders over $50
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <RotateCcw
                    size={22}
                    className="shrink-0 text-[#0F766E]"
                  />

                  <div>
                    <h3 className="font-['Poppins'] text-base font-semibold text-[#1E293B]">
                      Easy Returns
                    </h3>

                    <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                      Hassle-free returns within 30 days
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <ShieldCheck
                    size={22}
                    className="shrink-0 text-[#0F766E]"
                  />

                  <div>
                    <h3 className="font-['Poppins'] text-base font-semibold text-[#1E293B]">
                      Secure Payment
                    </h3>

                    <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                      100% secure payment
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Headphones
                    size={22}
                    className="shrink-0 text-[#0F766E]"
                  />

                  <div>
                    <h3 className="font-['Poppins'] text-base font-semibold text-[#1E293B]">
                      24/7 Support
                    </h3>

                    <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                      We&apos;re here to help anytime
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Delivery */}

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">

              <h3 className="mb-5 font-['Poppins'] text-base font-semibold text-[#1E293B]">
                Delivery Information
              </h3>

              <div className="flex gap-4">

                <MapPin
                  size={20}
                  className="shrink-0 text-[#0F766E]"
                />

                <div>
                  <p className="font-['Poppins'] text-sm font-medium text-[#334155]">
                    Dhaka, Bangladesh
                  </p>

                  <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                    Standard Delivery: 3-5 business days
                  </p>
                </div>

              </div>

            </div>

            {/* Seller */}

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">

              <h3 className="mb-4 font-['Poppins'] text-base font-semibold text-[#1E293B]">
                Sold By
              </h3>

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-['Poppins'] text-base font-semibold text-[#0F766E]">
                    {product.brand || "Shopora Seller"}
                  </p>

                  <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                    Trusted Seller
                  </p>
                </div>

                <CheckCircle2
                  size={20}
                  className="text-[#0F766E]"
                />

              </div>

            </div>

          </div>
        </div>

        {/* =====================================================
            DESCRIPTION / SPECIFICATION / REVIEWS
        ===================================================== */}

        <div className="mt-8 rounded-xl border border-[#E2E8F0] bg-white">

          {/* Tabs */}

          <div className="flex flex-wrap border-b border-[#E2E8F0]">

            {[
              "Description",
              "Specifications",
              `Reviews (${reviews})`,
              "Shipping & Returns",
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 font-['Poppins'] text-base font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-[#0F766E] text-[#0F766E]"
                    : "text-[#64748B] hover:text-[#0F766E]"
                }`}
              >
                {tab}
              </button>
            ))}

          </div>

          {/* Tab Content */}

          <div className="p-6">

            {activeTab === "Description" && (
              <div>
                <p className="font-['Poppins'] text-base leading-8 text-[#475569]">
                  {product.description ||
                    product.shortDescription ||
                    "No product description available."}
                </p>
              </div>
            )}

            {activeTab === "Specifications" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-lg bg-[#F8FAFC] p-4">
                  <p className="font-['Poppins'] text-sm text-[#64748B]">
                    Brand
                  </p>

                  <p className="mt-1 font-['Poppins'] text-base font-semibold text-[#334155]">
                    {product.brand || "N/A"}
                  </p>
                </div>

                <div className="rounded-lg bg-[#F8FAFC] p-4">
                  <p className="font-['Poppins'] text-sm text-[#64748B]">
                    Category
                  </p>

                  <p className="mt-1 font-['Poppins'] text-base font-semibold text-[#334155]">
                    {product.category}
                  </p>
                </div>

                <div className="rounded-lg bg-[#F8FAFC] p-4">
                  <p className="font-['Poppins'] text-sm text-[#64748B]">
                    SKU
                  </p>

                  <p className="mt-1 font-['Poppins'] text-base font-semibold text-[#334155]">
                    {product.sku || "N/A"}
                  </p>
                </div>

                <div className="rounded-lg bg-[#F8FAFC] p-4">
                  <p className="font-['Poppins'] text-sm text-[#64748B]">
                    Stock
                  </p>

                  <p className="mt-1 font-['Poppins'] text-base font-semibold text-[#334155]">
                    {product.stockQuantity}
                  </p>
                </div>

              </div>
            )}

            {activeTab === `Reviews (${reviews})` && (
              <div className="flex items-center gap-4">

                <span className="font-['Poppins'] text-4xl font-bold text-[#1E293B]">
                  {rating.toFixed(1)}
                </span>

                <div>

                  <div className="flex text-[#FFB020]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={19}
                        fill={
                          star <= Math.round(rating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
                    Based on {reviews} reviews
                  </p>

                </div>
              </div>
            )}

            {activeTab === "Shipping & Returns" && (
              <div className="space-y-4 font-['Poppins'] text-base leading-7 text-[#475569]">

                <p>
                  Standard delivery takes 3-5 business days.
                </p>

                <p>
                  Express delivery takes 1-2 business days and costs
                  $4.99.
                </p>

                <p>
                  Products can be returned within 30 days according to
                  Shopora return policy.
                </p>

              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
};

export default SingleProduct;