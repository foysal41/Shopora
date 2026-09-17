import { apiDelete, apiGet, apiPost } from "@/lib/core/server";
import { authClient } from "@/lib/auth-client";

export type ProductReview = {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerImage?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
};

export type ReviewInput = {
  productId: string;
  rating: number;
  comment: string;
};

type ReviewsResponse = {
  success: boolean;
  message: string;
  data: ProductReview[];
};

type ReviewResponse = {
  success: boolean;
  message: string;
  data: ProductReview;
};

export const getProductReviews = async (productId: string) => {
  const response = await apiGet<ReviewsResponse>(
    `/api/v1/reviews/product/${productId}`,
  );

  return response.data;
};

export const getCustomerReviews = async (
  customerId: string,
  sessionToken?: string,
) => {
  const response = await apiGet<ReviewsResponse>(
    `/api/v1/reviews/customer/${customerId}`,
    sessionToken
      ? { headers: { Authorization: `Bearer ${sessionToken}` } }
      : undefined,
  );

  return response.data;
};

export const saveReview = async (input: ReviewInput) => {
  const sessionResult = await authClient.getSession();
  const sessionToken = sessionResult.data?.session?.token;

  const response = await apiPost<ReviewResponse>(
    "/api/v1/reviews",
    input,
    sessionToken
      ? { headers: { Authorization: `Bearer ${sessionToken}` } }
      : undefined,
  );

  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const sessionResult = await authClient.getSession();
  const sessionToken = sessionResult.data?.session?.token;

  await apiDelete<{ success: boolean; message: string }>(
    `/api/v1/reviews/${reviewId}`,
    sessionToken
      ? { headers: { Authorization: `Bearer ${sessionToken}` } }
      : undefined,
  );
};