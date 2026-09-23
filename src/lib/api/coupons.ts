import { authClient } from "@/lib/auth-client";
import { apiDelete, apiGet } from "@/lib/core/server";
import { apiPost } from "@/lib/core/server";
import type { CreateCouponData, CreateCouponResponse } from "@/lib/actions/coupons";


export type Coupon = {
  id: string;
  couponCode: string;
  description: string | null;
  discountType: "FIXED_CART" | "PERCENTAGE" | "FIXED_PRODUCT";
  amount: number;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
};



// Get All Coupons
export const getCoupons = async (): Promise<{
  success: boolean;
  message: string;
  data: Coupon[];
}> => {
  return await apiGet<{
    success: boolean;
    message: string;
    data: Coupon[];
  }>("/api/v1/coupons");
};

export const deleteAdminCoupon = async (couponId: string) => {
  const sessionResult = await authClient.getSession();
  const token = sessionResult.data?.session?.token;

  return await apiDelete<{ success: boolean; message: string }>(
    `/api/v1/admin/coupons/${couponId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
};

export const createAdminCoupon = async (data: CreateCouponData) => {
  const sessionResult = await authClient.getSession();
  const token = sessionResult.data?.session?.token;

  return await apiPost<CreateCouponResponse>("/api/v1/coupons", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};