import { Bot, ChevronRight } from 'lucide-react'
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import type { MyOrder } from '@/lib/api/checkout';

type OrderAndTrackingProps = {
  orders: MyOrder[];
  loading?: boolean;
};

// Orders that are still moving through the pipeline (used to pick which
// order to show in the tracking widget).
const ACTIVE_STATUSES = [
  "PENDING",
  "PLACED",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
];

// OrderStatus enum -> human label.
const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  PLACED: "Placed",
  PAID: "Paid",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const getStatusClass = (status: string) => {
  if (status === "DELIVERED") {
    return "bg-[#EAF7E7] text-[#4D9A38]";
  }

  if (status === "PROCESSING" || status === "PACKED" || status === "PAID" || status === "SHIPPED") {
    return "bg-[#EAF3FF] text-[#2563EB]";
  }

  if (status === "CANCELLED" || status === "REFUNDED") {
    return "bg-[#F1F2F4] text-[#64748B]";
  }

  return "bg-[#FFF3E8] text-[#F97316]";
};

// How far along the 4-step timeline this order is.
const reachedStep = (status: string) => {
  if (status === "DELIVERED") return 4;
  if (status === "SHIPPED") return 3;
  if (status === "PROCESSING" || status === "PACKED") return 2;
  return 1; // PENDING / PLACED / PAID / CANCELLED / REFUNDED
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatShort = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });


const OrderAndTracking = ({ orders, loading }: OrderAndTrackingProps) => {
  const recentOrders = orders.slice(0, 4);

  // Prefer an order that's still in progress; otherwise fall back to the latest.
  const trackingOrder =
    orders.find((o) => ACTIVE_STATUSES.includes(o.status)) ?? orders[0];

  const reached = trackingOrder ? reachedStep(trackingOrder.status) : 0;
  const fillPct = reached > 0 ? ((reached - 1) / 3) * 84 : 0;

  const steps: { n: number; lines: string[] }[] = [
    { n: 1, lines: ["Order", "Placed"] },
    { n: 2, lines: ["Processing"] },
    { n: 3, lines: ["Shipped"] },
    { n: 4, lines: ["Delivered"] },
  ];

  return (
     <section className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1fr]">

        {/* Recent Orders */}
        <div className="overflow-hidden rounded-xl border border-[#E8EEEE] bg-white">

          <div className="flex items-center justify-between border-b border-[#E8EEEE] px-5 py-4">

            <h2 className="font-['Poppins'] text-[16px] font-semibold text-[#0F172A]">
              Recent Orders
            </h2>

            <Link
              href="/dashboard/customer/my-order"
              className="font-['Poppins'] text-[14px] font-medium text-[#0F766E] hover:underline"
            >
              View All Orders
            </Link>

          </div>

          <div className="px-4 pb-3">

            {loading ? (
              <p className="py-10 text-center font-['Poppins'] text-[14px] text-[#64748B]">
                Loading orders...
              </p>
            ) : recentOrders.length === 0 ? (
              <p className="py-10 text-center font-['Poppins'] text-[14px] text-[#64748B]">
                You haven&apos;t placed any orders yet.
              </p>
            ) : (
              recentOrders.map((order) => {
                const itemCount = order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                );

                return (
                  <div
                    key={order.id}
                    className="grid grid-cols-[56px_1fr_auto_20px] items-center gap-3 border-b border-[#EEF2F2] py-3 last:border-b-0 sm:grid-cols-[62px_1fr_100px_80px_20px]"
                  >

                    {/* Product Image */}
                    <div className="flex h-12 w-14 items-center justify-center overflow-hidden rounded-lg border border-[#E8EEEE] bg-white">

                      <Image
                        src={order.items[0]?.productImage || "/placeholder.png"}
                        alt={order.orderNumber}
                        className="h-full w-full object-contain"
                        height={512}
                        width={512}
                      />

                    </div>

                    {/* Order Info */}
                    <div className="min-w-0">

                      <p className="truncate font-['Poppins'] text-[14px] font-semibold text-[#0F766E]">
                        Order #{order.orderNumber}
                      </p>

                      <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
                        {formatDate(order.createdAt)}
                      </p>

                    </div>

                    {/* Price */}
                    <div className="hidden sm:block">

                      <p className="font-['Poppins'] text-[14px] font-semibold text-[#1E293B]">
                        ${order.total.toFixed(2)}
                      </p>

                      <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
                        {itemCount} {itemCount === 1 ? "Item" : "Items"}
                      </p>

                    </div>

                    {/* Status */}
                    <span
                      className={`hidden w-fit rounded-md px-3 py-1.5 font-['Poppins'] text-[14px] font-medium sm:inline-flex ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>

                    <ChevronRight
                      size={18}
                      className="text-[#475569]"
                    />

                  </div>
                );
              })
            )}

          </div>

        </div>


        {/* Right Column */}
        <div className="flex flex-col gap-5">

          {/* Order Tracking */}
          <div className="rounded-xl border border-[#E8EEEE] bg-white p-5">

            <div className="flex items-center justify-between">

              <h2 className="font-['Poppins'] text-[16px] font-semibold text-[#0F172A]">
                Order Tracking
              </h2>

              <Link
                href="/dashboard/customer/my-order"
                className="font-['Poppins'] text-[14px] font-medium text-[#0F766E] hover:underline"
              >
                View All
              </Link>

            </div>

            {!trackingOrder ? (
              <p className="py-10 text-center font-['Poppins'] text-[14px] text-[#64748B]">
                No orders to track yet.
              </p>
            ) : (
              <>
                <div className="mt-5 flex items-center justify-between">

                  <div>

                    <p className="font-['Poppins'] text-[14px] font-semibold text-[#334155]">
                      Order <span className="text-[#0F766E]">#{trackingOrder.orderNumber}</span>
                    </p>

                    <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
                      Placed on {formatDate(trackingOrder.createdAt)}
                    </p>

                  </div>

                  <span
                    className={`rounded-md px-3 py-1.5 font-['Poppins'] text-[14px] font-medium ${getStatusClass(
                      trackingOrder.status
                    )}`}
                  >
                    {statusLabel[trackingOrder.status] ?? trackingOrder.status}
                  </span>

                </div>


                {/* Tracking Timeline */}
                <div className="mt-7">

                  <div className="relative flex items-start justify-between">

                    <div className="absolute left-[8%] right-[8%] top-4 h-0.5 bg-[#E2E8F0]" />
                    <div
                      className="absolute left-[8%] top-4 h-0.5 bg-[#0F766E]"
                      style={{ width: `${fillPct}%` }}
                    />

                    {steps.map((step) => {
                      const isReached = step.n <= reached;

                      return (
                        <div
                          key={step.n}
                          className="relative z-10 flex flex-col items-center"
                        >

                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full font-['Poppins'] text-[14px] font-semibold text-white ${
                              isReached ? "bg-[#0F766E]" : "bg-[#CBD5E1]"
                            }`}
                          >
                            {step.n}
                          </div>

                          <p
                            className={`mt-2 text-center font-['Poppins'] text-[14px] ${
                              isReached
                                ? "font-semibold text-[#0F766E]"
                                : "font-medium text-[#64748B]"
                            }`}
                          >
                            {step.lines.map((line, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <br />}
                                {line}
                              </React.Fragment>
                            ))}
                          </p>

                          <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
                            {step.n === 1 ? formatShort(trackingOrder.createdAt) : "-"}
                          </p>

                        </div>
                      );
                    })}

                  </div>

                </div>
              </>
            )}

          </div>


          {/* AI Assistant */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-[#E8EEEE] bg-white p-5 sm:flex-row">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F5F3]">
                <Bot
                  size={24}
                  className="text-[#0F766E]"
                />
              </div>

              <div>

                <h3 className="font-['Poppins'] text-[14px] font-semibold text-[#1E293B]">
                  Shopora AI Assistant
                </h3>

                <p className="mt-1 max-w-md font-['Poppins'] text-[14px] leading-5 text-[#64748B]">
                  Get personalized product recommendations,
                  <br className="hidden sm:block" />
                  track orders, and more.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="flex cursor-pointer w-full items-center justify-center gap-2 rounded-lg border border-[#0F766E] px-5 py-3 font-['Poppins'] text-[14px] font-semibold text-[#0F766E] transition hover:bg-[#0F766E] hover:text-white sm:w-auto"
            >
              <Bot size={18} />
              Chat Now
            </button>

          </div>

        </div>

      </section>
  )
}

export default OrderAndTracking