import { apiPost } from "@/lib/core/server";

import { apiGet } from "@/lib/core/server";

export type MyOrderItem = {
  productId?: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  review?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
};

export type MyOrder = {
  id: string;
  orderNumber: string;
  status: string; // matches backend OrderStatus enum
  total: number;
  createdAt: string;
  items: MyOrderItem[];
};

export const getMyOrders = async (
  customerId: string,
  sessionToken?: string,
) => {
  const response = await apiGet<{
    success: boolean;
    message: string;
    data: MyOrder[];
  }>(`/api/v1/orders?customerId=${customerId}`, sessionToken
    ? { headers: { Authorization: `Bearer ${sessionToken}` } }
    : undefined);

  return response.data;
};





export type CreateOrderItem = {
  productId: string;
  quantity: number;
};

export type CreateOrderData = {
  customerId: string;

  items: CreateOrderItem[];

  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;

  paymentMethod?: string;

  shippingFee?: number;
  discount?: number;

  couponCode?: string;
  notes?: string;
};

export type CreateOrderResponse = {
  success: boolean;
  message: string;
  data: unknown;
};

export const createOrder = async ( data: CreateOrderData): Promise<CreateOrderResponse> => {
  return await apiPost<CreateOrderResponse>(
    "/api/v1/orders",
    data
  );
};