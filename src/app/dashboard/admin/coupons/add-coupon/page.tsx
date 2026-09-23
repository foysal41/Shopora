"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CreditCard, Percent, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createAdminCoupon } from "@/lib/api/coupons";
import type { CreateCouponData } from "@/lib/actions/coupons";

type DiscountType = "fixed-cart" | "percentage" | "fixed-product";

const discountOptions: Array<{
    id: DiscountType;
    title: string;
    description: string;
    icon: typeof CreditCard;
}> = [
    {
        id: "fixed-cart",
        title: "Fixed Cart Discount",
        description: "Get a fixed amount off on cart total",
        icon: CreditCard,
    },
    {
        id: "percentage",
        title: "Percentage Discount",
        description: "Get a percentage off on cart total",
        icon: Percent,
    },
    {
        id: "fixed-product",
        title: "Fixed Product Discount",
        description: "Get a fixed amount off on specific products",
        icon: Tag,
    },
];

const AdminAddCouponPage = () => {
    const router = useRouter();
    const [discountType, setDiscountType] = useState<DiscountType>("fixed-cart");
    const [couponCode, setCouponCode] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const couponData: CreateCouponData = {
            couponCode,
            description,
            discountType:
                discountType === "fixed-cart"
                    ? "FIXED_CART"
                    : discountType === "percentage"
                    ? "PERCENTAGE"
                    : "FIXED_PRODUCT",
            amount: Number(amount),
            expiryDate,
        };

        try {
            setIsSubmitting(true);
            await createAdminCoupon(couponData);
            toast.success("Coupon created successfully");
            router.push("/dashboard/admin/coupons");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create coupon");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-7">
            <div className="mx-auto max-w-7xl">
                <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#0F766E]">
                            Promotion management
                        </p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#14213D]">Add New Coupon</h1>
                        <div className="mt-1.5 flex items-center gap-2 text-sm text-[#64748B]">
                            <Link href="/dashboard/admin/coupons" className="hover:text-[#0F766E]">
                                Coupons
                            </Link>
                            <span>›</span>
                            <span className="text-[#334155]">Add New Coupon</span>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/admin/coupons"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D9E2EC] bg-white px-5 text-sm font-semibold text-[#14213D] shadow-sm hover:border-[#0F766E] hover:text-[#0F766E]"
                    >
                        <ArrowLeft size={16} /> Back to Coupons
                    </Link>
                </header>

                <form onSubmit={handleSubmit} className="rounded-xl border border-[#E5EAF0] bg-white p-5 shadow-sm sm:p-6">
                    <div>
                        <label htmlFor="admin-coupon-code" className="mb-2 block text-sm font-semibold text-[#1E293B]">
                            Coupon Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="admin-coupon-code"
                            type="text"
                            value={couponCode}
                            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                            placeholder="Enter coupon code (e.g. SAVE10)"
                            required
                            className="h-11 w-full rounded-lg border border-[#D8E0E8] px-3 text-sm text-[#1E293B] outline-none focus:border-[#0F766E]"
                        />
                    </div>

                    <div className="mt-5">
                        <label htmlFor="admin-coupon-description" className="mb-2 block text-sm font-semibold text-[#1E293B]">
                            Description <span className="font-normal text-[#64748B]">(Optional)</span>
                        </label>
                        <textarea
                            id="admin-coupon-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Enter coupon description..."
                            rows={3}
                            className="w-full resize-none rounded-lg border border-[#D8E0E8] px-3 py-3 text-sm text-[#1E293B] outline-none focus:border-[#0F766E]"
                        />
                    </div>

                    <fieldset className="mt-5">
                        <legend className="mb-2 text-sm font-semibold text-[#1E293B]">
                            Discount Type <span className="text-red-500">*</span>
                        </legend>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {discountOptions.map((option) => {
                                const Icon = option.icon;
                                const selected = discountType === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setDiscountType(option.id)}
                                        className={`flex min-h-23 cursor-pointer items-start gap-3 rounded-lg border p-4 text-left ${
                                            selected
                                                ? "border-[#0F766E] bg-[#F5FFFD]"
                                                : "border-[#D8E0E8] bg-white hover:border-[#9FBAB7]"
                                        }`}
                                    >
                                        <span
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                selected ? "border-[#0F766E]" : "border-[#B7C4D2]"
                                            }`}
                                        >
                                            {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#0F766E]" />}
                                        </span>
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F6F3] text-[#0F766E]">
                                            <Icon size={20} />
                                        </span>
                                        <span>
                                            <strong className="block text-sm text-[#1E293B]">{option.title}</strong>
                                            <span className="mt-1 block text-xs leading-5 text-[#64748B]">
                                                {option.description}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label htmlFor="admin-coupon-amount" className="mb-2 block text-sm font-semibold text-[#1E293B]">
                                Coupon Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="flex h-11 overflow-hidden rounded-lg border border-[#D8E0E8]">
                                <span className="flex w-10 items-center justify-center border-r border-[#D8E0E8] bg-[#F8FAFC] text-sm font-semibold text-[#475569]">
                                    $
                                </span>
                                <input
                                    id="admin-coupon-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) => setAmount(event.target.value)}
                                    placeholder="Enter amount"
                                    required
                                    className="min-w-0 flex-1 text-black px-3 text-sm outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="admin-coupon-expiry" className="mb-2 block text-sm font-semibold text-[#1E293B]">
                                Coupon Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <CalendarDays
                                    size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                                />
                                <input
                                    id="admin-coupon-expiry"
                                    type="date"
                                    value={expiryDate}
                                    onChange={(event) => setExpiryDate(event.target.value)}
                                    required
                                    className="h-11 text-black w-full rounded-lg border border-[#D8E0E8] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#0F766E]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#EEF2F6] pt-5 sm:flex-row sm:justify-end">
                        <Link
                            href="/dashboard/admin/coupons"
                            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D5DEE8] bg-white px-6 text-sm font-semibold text-[#334155] hover:border-[#0F766E] hover:text-[#0F766E]"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0B625B] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Creating..." : "Create Coupon"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default AdminAddCouponPage;