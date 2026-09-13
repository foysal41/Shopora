"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Eye,
  Filter,
  Package,
  Pencil,
  PieChart,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { getProduct } from "@/type/dashboard/Seller";


// =====================================================
// HELPERS
// =====================================================

const getStockStatus = (product: getProduct) => {
  const quantity = product.stockQuantity;
  const lowStock = product.lowStockAlert;

  if (quantity === 0) {
    return "out-of-stock";
  }

  if (quantity <= lowStock) {
    return "low-stock";
  }

  return "in-stock";
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "in-stock":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";

    case "low-stock":
      return "bg-orange-50 text-orange-700 border border-orange-200";

    case "out-of-stock":
      return "bg-red-50 text-red-600 border border-red-200";

    default:
      return "bg-gray-50 text-gray-600 border border-gray-200";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "in-stock":
      return "In Stock";

    case "low-stock":
      return "Low Stock";

    case "out-of-stock":
      return "Out of Stock";

    default:
      return status;
  }
};

// =====================================================
// COMPONENT
// =====================================================

const Inventory = () => {
  const [products, setProducts] = useState<getProduct[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [stockStatus, setStockStatus] = useState("All Stock Status");
  const [brand, setBrand] = useState("All Brands");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // =====================================================
  // API FETCH
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/products`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await response.json();

        if (result?.success && Array.isArray(result.data)) {
          setProducts(result.data);
        }
      } catch (error) {
        console.log("Using dummy inventory data:", error);
      }
    };

    fetchProducts();
  }, []);

  // =====================================================
  // FILTER OPTIONS
  // =====================================================

  const categories = useMemo(() => {
    return [
      "All Categories",
      ...Array.from(new Set(products.map((product) => product.category))),
    ];
  }, [products]);

  const brands = useMemo(() => {
    return [
      "All Brands",
      ...Array.from(
        new Set(products.map((product) => product.brand).filter(Boolean))
      ),
    ];
  }, [products]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const currentStockStatus = getStockStatus(product);

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      const matchesBrand =
        brand === "All Brands" || product.brand === brand;

      const matchesStock =
        stockStatus === "All Stock Status" ||
        currentStockStatus === stockStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesStock
      );
    });
  }, [products, search, category, stockStatus, brand]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => getStockStatus(product) === "low-stock"
  ).length;

  const outOfStockProducts = products.filter(
    (product) => getStockStatus(product) === "out-of-stock"
  ).length;

  const totalStockValue = products.reduce((total, product) => {
    const price = product.salePrice || product.regularPrice || 0;

    return total + price * product.stockQuantity;
  }, 0);

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

// =====================================================
// EXPORT INVENTORY REPORT
// =====================================================

const handleExport = () => {
  if (filteredProducts.length === 0) {
    alert("No inventory data available to export.");
    return;
  }

  const headers = [
    "Product Name",
    "SKU",
    "Category",
    "Brand",
    "Regular Price",
    "Sale Price",
    "Stock Quantity",
    "Low Stock Alert",
    "Stock Status",
    "Stock Value",
  ];

  const rows = filteredProducts.map((product) => {
    const status = getStockStatus(product);

    const stockValue =
      (product.salePrice || product.regularPrice || 0) *
      product.stockQuantity;

    return [
      product.name,
      product.sku,
      product.category,
      product.brand || "",
      product.regularPrice || 0,
      product.salePrice || "",
      product.stockQuantity,
      product.lowStockAlert,
      getStatusText(status),
      stockValue.toFixed(2),
    ];
  });

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");

          // Escape quotes and commas
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `shopora-inventory-${new Date()
    .toISOString()
    .split("T")[0]}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
  
  // =====================================================
  // RESET FILTER
  // =====================================================

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setStockStatus("All Stock Status");
    setBrand("All Brands");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-[Poppins,sans-serif] text-[#172554]">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

        <div>
          <h1 className="text-[28px] font-bold leading-tight text-[#172554]">
            Inventory
          </h1>

          <div className="mt-1 flex items-center gap-2 text-[14px] font-medium text-slate-500">
            <span>Home</span>
            <ChevronRight size={15} />
            <span>Inventory</span>
            <ChevronRight size={15} />
            <span className="text-[#172554]">All Inventory</span>
          </div>
        </div>

        <div className="flex gap-3">

          <button
           onClick={handleExport}
            className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-semibold text-[#0F766E] shadow-sm transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export Report
          </button>


        </div>
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Products */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <ShoppingBag
                size={23}
                className="text-[#0F766E]"
              />
            </div>

            <div>
              <p className="text-[14px] font-medium text-slate-500">
                Total Products
              </p>

              <h3 className="mt-1 text-[25px] font-bold text-[#172554]">
                {totalProducts}
              </h3>

              <p className="text-[13px] font-medium text-slate-500">
                All products
              </p>
            </div>

          </div>
        </div>

        {/* Low Stock */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50">
              <AlertTriangle
                size={23}
                className="text-orange-500"
              />
            </div>

            <div>
              <p className="text-[14px] font-medium text-slate-500">
                Low Stock Products
              </p>

              <h3 className="mt-1 text-[25px] font-bold text-[#172554]">
                {lowStockProducts}
              </h3>

              <p className="text-[13px] font-medium text-slate-500">
                Need attention
              </p>
            </div>

          </div>
        </div>

        {/* Out Of Stock */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-50">
              <Package
                size={23}
                className="text-purple-500"
              />
            </div>

            <div>
              <p className="text-[14px] font-medium text-slate-500">
                Out of Stock
              </p>

              <h3 className="mt-1 text-[25px] font-bold text-[#172554]">
                {outOfStockProducts}
              </h3>

              <p className="text-[13px] font-medium text-slate-500">
                Currently unavailable
              </p>
            </div>

          </div>
        </div>

        {/* Stock Value */}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <PieChart
                size={23}
                className="text-blue-500"
              />
            </div>

            <div>
              <p className="text-[14px] font-medium text-slate-500">
                Total Stock Value
              </p>

              <h3 className="mt-1 text-[24px] font-bold text-[#172554]">
                {formatMoney(totalStockValue)}
              </h3>

              <p className="text-[13px] font-medium text-slate-500">
                Estimated value
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* =================================================
          FILTER SECTION
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-4">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">

            {/* Search */}

            <div className="relative xl:col-span-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by name, SKU..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-[14px] font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
              />

            </div>

            {/* Category */}

            <div className="relative">

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[14px] font-medium text-slate-600 outline-none focus:border-[#0F766E]"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

            </div>

            {/* Stock Status */}

            <div className="relative">

              <select
                value={stockStatus}
                onChange={(e) => {
                  setStockStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[14px] font-medium text-slate-600 outline-none focus:border-[#0F766E]"
              >
                <option>All Stock Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

            </div>

            {/* Brand */}

            <div className="relative">

              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[14px] font-medium text-slate-600 outline-none focus:border-[#0F766E]"
              >
                {brands.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

            </div>

            {/* Filter */}

            <button
              onClick={resetFilters}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Filter size={17} />
              Filters
            </button>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-262.5">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">

                <th className="px-5 py-4 text-left text-[13px] font-bold text-slate-700">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-[13px] font-bold text-slate-700">
                  SKU
                </th>

                <th className="px-5 py-4 text-left text-[13px] font-bold text-slate-700">
                  Category
                </th>

                <th className="px-5 py-4 text-center text-[13px] font-bold text-slate-700">
                  Stock
                </th>

                <th className="px-5 py-4 text-center text-[13px] font-bold text-slate-700">
                  Low Stock Alert
                </th>

                <th className="px-5 py-4 text-center text-[13px] font-bold text-slate-700">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-[13px] font-bold text-slate-700">
                  Stock Value
                </th>

                <th className="px-5 py-4 text-center text-[13px] font-bold text-slate-700">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {

                  const status = getStockStatus(product);

                  const stockValue =
                    (product.salePrice || product.regularPrice || 0) *
                    product.stockQuantity;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/50"
                    >

                      {/* Product */}

                      <td className="px-5 py-3">

                        <div className="flex items-center gap-3">

                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">

                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package
                                  size={20}
                                  className="text-slate-400"
                                />
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="max-w-55 truncate text-[14px] font-bold text-[#172554]">
                              {product.name}
                            </p>

                            {product.shortDescription && (
                              <p className="mt-0.5 max-w-55 truncate text-[12px] font-medium text-slate-500">
                                {product.shortDescription}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* SKU */}

                      <td className="px-5 py-3 text-[13px] font-semibold text-slate-600">
                        {product.sku}
                      </td>

                      {/* Category */}

                      <td className="px-5 py-3 text-[13px] font-semibold text-slate-600">
                        {product.category}
                      </td>

                      {/* Stock */}

                      <td className="px-5 py-3 text-center">

                        <span
                          className={`text-[14px] font-bold ${
                            status === "in-stock"
                              ? "text-[#0F766E]"
                              : status === "low-stock"
                              ? "text-orange-500"
                              : "text-red-500"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>

                      </td>

                      {/* Low Stock Alert */}

                      <td className="px-5 py-3 text-center text-[13px] font-semibold text-slate-600">
                        {product.lowStockAlert}
                      </td>

                      {/* Status */}

                      <td className="px-5 py-3 text-center">

                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-[12px] font-semibold ${getStatusStyle(
                            status
                          )}`}
                        >
                          {getStatusText(status)}
                        </span>

                      </td>

                      {/* Stock Value */}

                      <td className="px-5 py-3 text-right text-[13px] font-bold text-[#172554]">
                        {formatMoney(stockValue)}
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-3">

                        <div className="flex items-center justify-center gap-2">

                          <button
                            title="View Product"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0F766E] hover:text-[#0F766E]"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            title="Edit Product"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0F766E] hover:text-[#0F766E]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            title="Update Stock"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0F766E] hover:text-[#0F766E]"
                          >
                            <RotateCcw size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center"
                  >
                    <Package
                      size={42}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-[16px] font-bold text-slate-600">
                      No products found
                    </p>

                    <p className="mt-1 text-[14px] font-medium text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[14px] font-medium text-slate-500">
            Showing{" "}
            <span className="font-bold text-[#172554]">
              {filteredProducts.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[#172554]">
              {Math.min(
                currentPage * itemsPerPage,
                filteredProducts.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#172554]">
              {filteredProducts.length}
            </span>{" "}
            products
          </p>

          <div className="flex items-center gap-2">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-bold transition ${
                    currentPage === page
                      ? "bg-[#0F766E] text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

            {totalPages > 5 && (
              <span className="px-1 text-[14px] font-bold text-slate-400">
                ...
              </span>
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>

            <div className="relative ml-2">

              <select
                className="h-9 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] font-semibold text-slate-600 outline-none"
                defaultValue="8"
              >
                <option value="8">8 / page</option>
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              />

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Inventory;