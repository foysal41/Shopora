"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Store } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  getAdminProducts,
  type AdminProduct,
} from "@/lib/api/adminProducts";

const AdminProductsPage = () => {
  const { data: session, isPending } = useSession();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [sellerFilter, setSellerFilter] = useState("All sellers");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending || !session?.user?.id) return;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        setProducts(await getAdminProducts());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [isPending, session?.user?.id]);

  const sellers = useMemo(
    () => ["All sellers", ...Array.from(new Set(products.map((product) => product.sellerName))).sort()],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSeller =
        sellerFilter === "All sellers" || product.sellerName === sellerFilter;
      const matchesSearch =
        !query ||
        `${product.name} ${product.category || ""} ${product.sku || ""}`
          .toLowerCase()
          .includes(query);

      return matchesSeller && matchesSearch;
    });
  }, [products, search, sellerFilter]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-2xl font-semibold text-[#0F172A]">
              Products
            </h1>
            <p className="mt-1 font-['Poppins'] text-sm text-[#64748B]">
              View every product and the seller who created it.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-lg border border-[#E8EEEE] bg-white px-3 py-2 sm:w-72">
              <Search size={16} className="shrink-0 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                className="w-full font-['Poppins'] text-sm outline-none"
              />
            </div>
            <select
              value={sellerFilter}
              onChange={(event) => setSellerFilter(event.target.value)}
              className="cursor-pointer rounded-lg border border-[#E8EEEE] bg-white px-3 py-2 font-['Poppins'] text-sm text-[#475569] outline-none"
              aria-label="Filter products by seller"
            >
              {sellers.map((seller) => (
                <option key={seller} value={seller}>
                  {seller}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 font-['Poppins'] text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">
          {loading ? (
            <p className="py-16 text-center font-['Poppins'] text-sm text-[#64748B]">
              Loading products...
            </p>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Package size={32} className="text-[#94A3B8]" />
              <p className="font-['Poppins'] text-sm text-[#64748B]">
                No products match the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const price =
                  product.salePrice && product.salePrice > 0
                    ? product.salePrice
                    : product.regularPrice;

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white"
                  >
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative flex h-48 items-center justify-center bg-[#F8FAFC]">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-contain p-5"
                          />
                        ) : (
                          <Package size={34} className="text-[#94A3B8]" />
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className="truncate font-['Poppins'] text-base font-semibold text-[#1E293B]">
                          {product.name}
                        </h2>
                        <p className="mt-1 font-['Poppins'] text-sm text-[#0F766E]">
                          ${price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                    <div className="border-t border-[#EEF2F2] px-4 py-3">
                      <div className="flex items-center gap-2 font-['Poppins'] text-sm text-[#475569]">
                        <Store size={16} className="text-[#0F766E]" />
                        <span className="truncate">{product.sellerName}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 font-['Poppins'] text-xs text-[#64748B]">
                        <span>{product.category || "Uncategorized"}</span>
                        <span>{product.stockQuantity} in stock</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminProductsPage;