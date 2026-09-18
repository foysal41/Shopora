import { Box, CircleDollarSign, Package, Store, Users } from 'lucide-react';
import type { AdminCustomer } from '@/lib/api/adminCustomers';
import type { AdminProduct } from '@/lib/api/adminProducts';
import React from 'react'
import { useMemo } from 'react';

type StatCardsProps = {
  products: AdminProduct[];
  customers: AdminCustomer[];
  loading: boolean;
};

const StatCards = ({ products, customers, loading }: StatCardsProps) => {
  const stats = useMemo(() => {
    const inventoryValue = products.reduce((total, product) => {
      const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;
      return total + product.stockQuantity * price;
    }, 0);
    const lowStock = products.filter((product) => product.stockQuantity <= 5).length;
    const sellers = new Set(products.map((product) => product.sellerName)).size;

    return [
      { title: "Inventory Value", value: `$${inventoryValue.toFixed(2)}`, icon: CircleDollarSign, type: "teal" },
      { title: "Total Customers", value: customers.length.toLocaleString(), icon: Users, type: "teal" },
      { title: "Total Products", value: products.length.toLocaleString(), icon: Box, type: "teal" },
      { title: "Low Stock Items", value: lowStock.toLocaleString(), icon: Package, type: "coral" },
      { title: "Active Sellers", value: sellers.toLocaleString(), icon: Store, type: "teal" },
    ];
  }, [customers.length, products]);

  return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {stats.map((stat) => {
            const Icon = stat.icon;

            const iconStyle =
              stat.type === "coral"
                ? "bg-[#FFF0F0] text-[#FF6B6B]"
                : "bg-[#E8F5F3] text-[#0F766E]";

            const chartClass =
              stat.type === "coral"
                ? "text-[#FF6B6B]"
                : "text-[#0F766E]";

            return (
              <div
                key={stat.title}
                className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white p-4 shadow-[0_2px_10px_rgba(15,118,110,0.04)]"
              >

                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${iconStyle}`}
                  >
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                </div>

                <p className="mt-3 font-['Poppins'] text-[13px] text-[#64748B]">
                  {stat.title}
                </p>

                <h2 className="mt-0.5 font-['Poppins'] text-xl font-bold text-[#1E293B]">
                  {stat.value}
                </h2>

                <p className="mt-1 font-['Poppins'] text-[11px] text-[#94A3B8]">
                  {loading ? "Loading live data..." : "Live data"}{" "}
                  <span className="text-[#94A3B8]">
                    from your store
                  </span>
                </p>

                {/* Small chart */}

                <div className={`mt-3 h-8 ${chartClass}`}>
                  <svg
                    viewBox="0 0 180 35"
                    className="h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 27 C15 17, 22 31, 35 23 C49 15, 57 29, 72 20 C87 11, 92 27, 108 18 C123 10, 132 23, 145 14 C158 5, 168 14, 180 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

              </div>
            );
          })}

        </div>
  )
}

export default StatCards