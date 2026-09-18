'use client';

import { Package, Store } from 'lucide-react';
import Link from 'next/link';
import type { AdminProduct } from '@/lib/api/adminProducts';
import React from 'react'

type SalesOrderLowstockStatusProps = {
  products: AdminProduct[];
  loading: boolean;
};

const SalesOrderLowstockStatus = ({ products, loading }: SalesOrderLowstockStatusProps) => {
  const categoryStock = Array.from(
    products.reduce((categories, product) => {
      const category = product.category || "Uncategorized";
      categories.set(category, (categories.get(category) || 0) + product.stockQuantity);
      return categories;
    }, new Map<string, number>()),
  ).sort(([, firstStock], [, secondStock]) => secondStock - firstStock).slice(0, 5);
  const lowStockProducts = [...products].sort((first, second) => first.stockQuantity - second.stockQuantity).slice(0, 5);

  return (
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">

          {/* =================================================
              SALES OVERVIEW
          ================================================= */}

          <div className="rounded-xl border border-[#E8EEEE] bg-white p-4 xl:col-span-6">

            <div className="flex items-center justify-between">

              <h2 className="font-['Poppins'] text-[15px] font-semibold text-[#1E293B]">
                Inventory by Category
              </h2>

            </div>

            <div className="mt-5 space-y-4">
              {loading ? <p className="py-12 text-center text-sm text-[#64748B]">Loading inventory...</p> : categoryStock.length === 0 ? <p className="py-12 text-center text-sm text-[#64748B]">No inventory data available.</p> : categoryStock.map(([category, stock]) => {
                const maximumStock = categoryStock[0][1] || 1;
                return <div key={category}><div className="flex items-center justify-between text-xs"><span className="font-medium text-[#475569]">{category}</span><span className="text-[#64748B]">{stock} units</span></div><div className="mt-1 h-2 rounded-full bg-[#F1F5F9]"><div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${Math.max(8, (stock / maximumStock) * 100)}%` }} /></div></div>;
              })}
            </div>

          </div>


          {/* =================================================
              ORDER STATUS
          ================================================= */}

          <div className="rounded-xl border border-[#E8EEEE] bg-white p-4 xl:col-span-3">

            <div className="flex items-center justify-between">

              <h2 className="font-['Poppins'] text-[15px] font-semibold text-[#1E293B]">
                Seller Coverage
              </h2>

              <Link href="/dashboard/admin/products" className="cursor-pointer font-['Poppins'] text-[11px] font-medium text-[#0F766E]">
                View All
              </Link>

            </div>

            <div className="mt-3 space-y-2">

              {loading ? <p className="py-8 text-center text-xs text-[#64748B]">Loading sellers...</p> : Array.from(new Set(products.map((product) => product.sellerName))).slice(0, 6).map((seller) => <div key={seller} className="flex items-center gap-2"><Store size={15} className="text-[#0F766E]" /><span className="truncate text-[11px] text-[#475569]">{seller}</span></div>)}

            </div>

          </div>


          {/* =================================================
              LOW STOCK ALERTS
          ================================================= */}

          <div className="rounded-xl border border-[#E8EEEE] bg-white p-4 xl:col-span-3">

            <div className="flex items-center justify-between">

              <h2 className="font-['Poppins'] text-[15px] font-semibold text-[#1E293B]">
                Low Stock Alerts
              </h2>

              <Link href="/dashboard/admin/catalog-health" className="cursor-pointer font-['Poppins'] text-[11px] font-medium text-[#0F766E]">
                View All
              </Link>

            </div>

            <div className="mt-3 space-y-3">

              {loading ? <p className="py-8 text-center text-xs text-[#64748B]">Loading stock alerts...</p> : lowStockProducts.length === 0 ? <p className="py-8 text-center text-xs text-[#64748B]">No products available.</p> : lowStockProducts.map((product) => (
                <div key={product.name}>

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F8FAFC]">
                        <Package
                          size={14}
                          className="text-[#475569]"
                        />
                      </div>

                      <div>
                        <p className="font-['Poppins'] text-[10px] font-medium text-[#334155]">
                          {product.name}
                        </p>

                        <p className="font-['Poppins'] text-[9px] text-[#94A3B8]">
                          Stock: {product.stockQuantity}
                        </p>
                      </div>

                    </div>

                  </div>

                  <div className="mt-1 h-1 rounded-full bg-[#F1F5F9]">
                    <div
                      className="h-full rounded-full bg-[#0F766E]"
                      style={{ width: `${Math.max(8, Math.min(100, product.stockQuantity * 10))}%` }}
                    />
                  </div>

                </div>
              ))}

            </div>

            <Link href="/dashboard/admin/products" className="mt-4 flex w-full cursor-pointer justify-center rounded-md border border-[#0F766E] py-2 font-['Poppins'] text-[11px] font-medium text-[#0F766E] transition-colors hover:bg-[#0F766E] hover:text-white">
              View All Products
            </Link>

          </div>

        </div>
  )
}

export default SalesOrderLowstockStatus