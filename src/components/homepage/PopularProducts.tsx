"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getPopularProducts } from "@/lib/api/homepage/popularProducts";
import { PopularProduct } from "@/type/homePage";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { addToWishlist } from "@/lib/api/wishlist";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";


const PopularProducts = () => {
  const [products, setProducts] = useState<PopularProduct[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const [wishlistedProducts, setWishlistedProducts] = useState<string[]>([]);

  const router = useRouter();

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getPopularProducts();
        setProducts(data);
      } catch (error) {
        console.error("GET POPULAR PRODUCTS ERROR:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToWishlist = async (productId: string) => {
    if (!userId) {
      toast.error("Please log in to save items to your wishlist");
      router.push("/auth/login");
      return;
    }

    if (wishlistedProducts.includes(productId)) {
      toast("This item is already in your wishlist");
      return;
    }

    try {
      setWishlistLoading(productId);

      await addToWishlist(userId, productId);

      setWishlistedProducts((prev) => [...prev, productId]);

      window.dispatchEvent(new Event("wishlist-updated"));

      toast.success("Added to your wishlist");
    } catch (error) {
      console.error("ADD TO WISHLIST ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add to wishlist"
      );
    } finally {
      setWishlistLoading(null);
    }
  };

  return (
    <section className="bg-white px-4 py-15 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-['Poppins'] text-lg font-semibold tracking-tight text-[#1E293B] md:text-2xl">
            Popular Products
          </h2>

          <Link
            href="/shop"
            className="group flex items-center gap-1.5 font-['Poppins'] text-xs font-medium text-[#0F766E] transition-colors duration-300 hover:text-[#FF6B6B] sm:text-sm"
          >
            View All Products

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">

          {products.map((product) => {
            const price =
              product.salePrice && product.salePrice > 0
                ? product.salePrice
                : product.regularPrice;

            const isWishlisted = wishlistedProducts.includes(product.id);

            return (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-xl border border-[#E8EEEE] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#CFE7E4] hover:shadow-[0_8px_25px_rgba(15,118,110,0.10)]"
              >

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => handleAddToWishlist(product.id)}
                  disabled={wishlistLoading === product.id}
                  aria-label={`Add ${product.name} to wishlist`}
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#94A3B8] shadow-sm transition-all duration-300 hover:text-[#FF6B6B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Heart
                    size={15}
                    strokeWidth={1.8}
                    fill={isWishlisted ? "currentColor" : "none"}
                    className={
                      isWishlisted
                        ? "text-[#FF6B6B]"
                        : "text-[#94A3B8]"
                    }
                  />
                </button>

                {/* Image */}
                <Link
                  href={`/products/${product.id}`}
                  className="block"
                >
                  <div className="relative flex h-36 items-center justify-center overflow-hidden bg-[#F6FAF9] sm:h-40">

                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={220}
                        height={220}
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="font-['Poppins'] text-[14px] text-[#94A3B8]">
                        No Image
                      </div>
                    )}

                  </div>
                </Link>

                {/* Product Information */}
                <div className="px-3 pb-3 pt-2.5">

                  {/* Product Name */}
                  <Link
                    href={`/products/${product.id}`}
                    className="block"
                  >
                    <h3 className="truncate font-['Poppins'] text-[14px] font-semibold text-[#1E293B] transition-colors hover:text-[#0F766E] md:text-[16px]">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-0.5 truncate font-['Poppins'] text-[12px] text-[#94A3B8]">
                    {product.shortDescription || product.category}
                  </p>

                  <p className="mt-1 truncate font-['Poppins'] text-[11px] text-[#0F766E]">
                    {product.category}
                  </p>

                  {/* Stock */}
                  <div className="mt-1">
                    <span
                      className={`font-['Poppins'] text-[11px] ${
                        product.stockQuantity > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {product.stockQuantity > 0
                        ? `${product.stockQuantity} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-1 flex items-center gap-2">

                    <span className="font-['Poppins'] text-[14px] font-bold text-[#1E293B]">
                      ${price.toFixed(2)}
                    </span>

                    {product.salePrice &&
                      product.salePrice > 0 &&
                      product.salePrice < product.regularPrice && (
                        <span className="font-['Poppins'] text-[10px] text-[#94A3B8] line-through">
                          ${product.regularPrice.toFixed(2)}
                        </span>
                      )}

                  </div>

                  {/* Add To Cart */}
                  <Link
                    href={`/products/${product.id}`}
                    className="mt-2.5 flex w-full items-center justify-center rounded-md bg-[#0F766E] py-2 font-['Poppins'] text-[14px] font-medium text-white transition-all duration-300 hover:bg-[#0B625B]"
                  >
                    Buy Now
                  </Link>

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
};

export default PopularProducts;