"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  Plus,
  Share2,
} from "lucide-react";
import { getProduct } from "@/type/dashboard/Seller";
import { getProducts } from "@/lib/api/getProducts";
import { DeleteProduct } from "@/lib/api/deleteProduct";
import { toast } from "react-hot-toast";
import DeleteConfirmModal from "@/components/dashboard/seller/DeleteConfirmModal";
import AIProductShareModal from "@/components/dashboard/seller/AIProductShareModal";


/* =========================================================
   STATUS STYLE
========================================================= */

const getStatusStyle = (status: getProduct["status"]) => {
  if (status === "Published") {
    return "border-[#BDE8D3] bg-[#EAF8F1] text-[#16875A]";
  }

  if (status === "Pending") {
    return "border-[#FFD8A8] bg-[#FFF5E8] text-[#E87500]";
  }

  return "border-[#D9E0E8] bg-[#F1F4F7] text-[#64748B]";
};

/* =========================================================
   COMPONENT
========================================================= */

const AllProducts = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState<getProduct[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
const [shareProductId, setShareProductId] = useState<string | null>(null);
const [shareProduct, setShareProduct] = useState<getProduct | null>(null);

  const productsPerPage = 6;


  useEffect(()=>{
    const fetchProducts = async () => {
      try{
        setLoading(true)
        
        const data = await getProducts();
        // console.log("Products from Backend: " , data)
        setProducts(data)
      }catch(err){
        // console.log("Failed to fetch products: " , err)
        setError("Failed to fetch products")
      }finally{
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])


  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.sku.toLowerCase().includes(searchValue) ||
        product.shortDescription.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      const matchesStatus =
        status === "All Status" || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleStatus = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

 const handleDelete = async () => {
  if (!deleteProductId) return;

  try {
    await DeleteProduct(deleteProductId);

    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== deleteProductId)
    );

    setDeleteProductId(null);

    toast.success("Product deleted successfully!");
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to delete product"
    );
  }
};


  return (
    <section className="min-h-screen bg-[#FCFDFD] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="">
        <DeleteConfirmModal
          isOpen={deleteProductId !== null}
          onClose={() => setDeleteProductId(null)}
          onConfirm={handleDelete}
        />

        <AIProductShareModal
          isOpen={shareProduct !== null}
          productId={shareProduct?.id ?? null}
          productName={shareProduct?.name}
          onClose={() => setShareProduct(null)}
        />

        {/* =====================================================
            PAGE HEADER — START
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-2xl font-bold text-[#1E293B] sm:text-3xl">
              All Products
            </h1>

            <div className="mt-1.5 flex items-center gap-2 font-['Poppins'] text-[14px] text-[#64748B]">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-[#0F766E]"
              >
                Home
              </Link>

              <ChevronRight size={14} />

              <Link
                href="/dashboard/products"
                className="transition-colors hover:text-[#0F766E]"
              >
                Products
              </Link>

              <ChevronRight size={14} />

              <span className="text-[#94A3B8]">All Products</span>
            </div>
          </div>

          <Link
            href="/dashboard/seller/products/add"
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[#0F766E]
              px-5
              font-['Poppins']
              text-[14px]
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-[#0B625B]
              hover:shadow-md
            "
          >
            <Plus size={17} strokeWidth={2} />
            Add New Product
          </Link>
        </div>

        {/* =====================================================
            PAGE HEADER — END
        ====================================================== */}

        {/* =====================================================
            PRODUCTS CONTAINER — START
        ====================================================== */}

        <div className="mt-6 overflow-hidden rounded-xl border border-[#E8EEEE] bg-white shadow-[0_2px_12px_rgba(15,118,110,0.04)]">
          {/* =====================================================
              FILTER BAR — START
          ====================================================== */}

          <div className="border-b border-[#E8EEEE] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1.8fr_0.8fr_0.8fr_auto]">
              {/* Search */}

              <div className="relative">
                <Search
                  size={18}
                  strokeWidth={1.8}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products by name, SKU..."
                  className="
                    h-11
                    w-full
                    rounded-lg
                    border
                    border-[#DDE5E5]
                    bg-white
                    pl-10
                    pr-4
                    font-['Poppins']
                    text-[14px]
                    text-[#1E293B]
                    outline-none
                    transition-all
                    placeholder:text-[#94A3B8]
                    focus:border-[#0F766E]
                    focus:ring-2
                    focus:ring-[#0F766E]/10
                  "
                />
              </div>

              {/* Category */}

              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => handleCategory(e.target.value)}
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-lg
                    border
                    border-[#DDE5E5]
                    bg-white
                    px-4
                    pr-10
                    font-['Poppins']
                    text-[14px]
                    text-[#475569]
                    outline-none
                    focus:border-[#0F766E]
                  "
                >
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home Appliances</option>
                  <option>Home & Living</option>
                  <option>Bags</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
              </div>

              {/* Status */}

              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => handleStatus(e.target.value)}
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-lg
                    border
                    border-[#DDE5E5]
                    bg-white
                    px-4
                    pr-10
                    font-['Poppins']
                    text-[14px]
                    text-[#475569]
                    outline-none
                    focus:border-[#0F766E]
                  "
                >
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Pending</option>
                  <option>Draft</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
              </div>

              {/* Filter Button */}

              <button
                type="button"
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-[#DDE5E5]
                  bg-white
                  px-5
                  font-['Poppins']
                  text-[14px]
                  font-medium
                  text-[#475569]
                  transition-all
                  hover:border-[#0F766E]
                  hover:bg-[#F6FAF9]
                  hover:text-[#0F766E]
                "
              >
                <SlidersHorizontal size={17} />
                Filters
              </button>
            </div>
          </div>

          {/* =====================================================
              FILTER BAR — END
          ====================================================== */}

          {/* =====================================================
              DESKTOP PRODUCT TABLE — START
          ====================================================== */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-237.5 border-collapse">
              {/* Table Header */}

              <thead>
                <tr className="border-b border-[#E8EEEE] bg-[#FCFDFD]">
                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Product
                  </th>

                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    SKU
                  </th>

                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Category
                  </th>

                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Price
                  </th>

                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Stock
                  </th>

                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Status
                  </th>

                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Created At
                  </th>

                  <th className="px-4 py-4 text-center font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Share
                  </th>

                  <th className="px-4 py-4 text-left font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}

              <tbody>
                {visibleProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#E8EEEE] transition-colors hover:bg-[#FAFCFC]"
                  >
                    {/* Product */}

                    <td className="px-4 py-3">
                      <div className="flex min-w-60 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F7F7]">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-['Poppins'] text-[14px] font-semibold text-[#1E293B]">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}

                    <td className="px-4 py-3 font-['Poppins'] text-[14px] text-[#475569]">
                      {product?.sku}
                    </td>

                    {/* Category */}

                    <td className="px-4 py-3 font-['Poppins'] text-[14px] text-[#475569]">
                      {product?.category}
                    </td>

                    {/* Price */}

                    <td className="px-4 py-3 font-['Poppins'] text-[14px] font-medium text-[#334155]">
                      ${product?.salePrice.toFixed(2)}
                    </td>

                    {/* Stock */}

                    <td className="px-4 py-3">
                      <span
                        className={`font-['Poppins'] text-[14px] font-semibold ${
                          product?.stockQuantity < 50
                            ? "text-[#F97316]"
                            : "text-[#0F766E]"
                        }`}
                      >
                        {product?.stockStatus}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-4 py-3">
                      <span
                        className={` inline-flex rounded-md border px-2.5 py-1 font-['Poppins'] text-[14px] font-medium ${getStatusStyle(product.status)} `}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Created */}

                    <td className="whitespace-nowrap px-4 py-3 font-['Poppins'] text-[14px] text-[#475569]">
                      {product.createdAt}
                    </td>

                    {/* Share */}

                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShareProduct(product);
                          }}
                          className=" flex h-9 w-9 items-center justify-center rounded-lg border border-[#BDE8D3]  bg-[#F0FBF6] text-[#0F766E] transition-all duration-200 hover:border-[#0F766E]  hover:bg-[#E8F5F3] hover:shadow-sm "
                          title="AI Product Share"
                        >
                          <Share2 size={17} strokeWidth={2} />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/seller/products/${product.id}`}
                          className="
                            flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E5] text-[#475569] transition-all hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]
                          "
                          title="View Product"
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          href={`/dashboard/seller/products/${product.id}/edit`}
                          className=" flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E5] text-[#475569] transition-all hover:border-[#0F766E]
                            hover:bg-[#E8F5F3] hover:text-[#0F766E]
                          "
                          title="Edit Product"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setShareProductId(product.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E5] text-[#475569] transition-all hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                          title="AI Product Share"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* =====================================================
              DESKTOP PRODUCT TABLE — END
          ====================================================== */}

          {/* =====================================================
              MOBILE PRODUCT CARDS — START
          ====================================================== */}

          <div className="divide-y divide-[#E8EEEE] lg:hidden">
            {visibleProducts.map((product) => (
              <div key={product.id} className="p-4 sm:p-5">
                <div className="flex gap-3">
                  {/* Image */}

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F7F7]">
                    <Image
                      src={product?.images[0]}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Product Info */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-['Poppins'] text-[14px] font-semibold text-[#1E293B]">
                          {product.name}
                        </h3>

                        <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
                          {product?.shortDescription}
                        </p>
                      </div>

                      <span
                        className={` shrink-0 rounded-md border px-2 py-1 font-['Poppins'] text-[14px] font-medium ${getStatusStyle(product.status)} `}
                      >
                        {product.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="font-['Poppins'] text-[14px] text-[#94A3B8]">
                          SKU
                        </p>

                        <p className="font-['Poppins'] text-[14px] font-medium text-[#475569]">
                          {product.sku}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Poppins'] text-[14px] text-[#94A3B8]">
                          Category
                        </p>

                        <p className="font-['Poppins'] text-[14px] font-medium text-[#475569]">
                          {product.category}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Poppins'] text-[14px] text-[#94A3B8]">
                          Price
                        </p>

                        <p className="font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                          ${product?.salePrice.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Poppins'] text-[14px] text-[#94A3B8]">
                          Stock
                        </p>

                        <p
                          className={`font-['Poppins'] text-[14px] font-semibold ${
                            product?.stockQuantity < 50
                              ? "text-[#F97316]"
                              : "text-[#0F766E]"
                          }`}
                        >
                          {product?.stockQuantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Actions */}

                <div className="mt-4 flex items-center justify-between border-t border-[#E8EEEE] pt-3">
                  <p className="font-['Poppins'] text-[14px] text-[#64748B]">
                    {product.createdAt}
                  </p>

                  <div className="flex items-center gap-2">
                    {/* View */}

                    <Link
                      href={`/dashboard/seller/products/${product.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E5] text-[#475569] transition-all hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                      title="View Product"
                    >
                      <Eye size={16} />
                    </Link>

                    {/* Edit */}

                    <Link
                      href={`/dashboard/seller/products/${product.id}/edit`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E5] text-[#475569] transition-all hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:text-[#0F766E]"
                      title="Edit Product"
                    >
                      <Pencil size={16} />
                    </Link>

                    {/* Share */}

                    <button
                      type="button"
                      onClick={() => {
                        setShareProduct(product);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#BDE8D3] bg-[#F0FBF6] text-[#0F766E] transition-all duration-200 hover:border-[#0F766E] hover:bg-[#E8F5F3] hover:shadow-sm"
                      title="AI Product Share"
                    >
                      <Share2 size={16} strokeWidth={2} />
                    </button>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteProductId(product.id);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FFD0D0] text-[#EF4444] transition-all hover:border-[#EF4444] hover:bg-[#FFF5F5]"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* =====================================================
              MOBILE PRODUCT CARDS — END
          ====================================================== */}

          {/* =====================================================
              EMPTY STATE — START
          ====================================================== */}

          {visibleProducts.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5F3]">
                <Search size={22} className="text-[#0F766E]" />
              </div>

              <h3 className="mt-4 font-['Poppins'] text-[16px] font-semibold text-[#1E293B]">
                No products found
              </h3>

              <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
                Try changing your search or filter options.
              </p>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE — END
          ====================================================== */}

          {/* =====================================================
              PAGINATION — START
          ====================================================== */}

          <div className="flex flex-col gap-4 border-t border-[#E8EEEE] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="font-['Poppins'] text-[14px] text-[#64748B]">
              Showing{" "}
              <span className="font-medium text-[#334155]">
                {filteredProducts.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-[#334155]">
                {Math.min(
                  startIndex + productsPerPage,
                  filteredProducts.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[#334155]">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>

            <div className="flex items-center gap-1.5">
              {/* Previous */}

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E5] text-[#64748B] transition-colors hover:bg-[#F6FAF9] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              {/* Pages */}

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 font-['Poppins'] text-[14px] font-medium transition-colors ${currentPage === page ? "bg-[#0F766E] text-white" : "border border-[#DDE5E5] bg-white text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0F766E]"}`}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* Next */}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="
                  flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E5] text-[#64748B] transition-colors hover:bg-[#F6FAF9] hover:text-[#0F766E] disabled:cursor-not-allowed disabled:opacity-40
                "
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* =====================================================
              PAGINATION — END
          ====================================================== */}
        </div>

        {/* =====================================================
            PRODUCTS CONTAINER — END
        ====================================================== */}
      </div>
    </section>
  );
};

export default AllProducts;