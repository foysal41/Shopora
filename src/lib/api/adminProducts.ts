import { authClient } from "@/lib/auth-client";
import { apiGet } from "@/lib/core/server";

export type AdminProduct = {
  id: string;
  name: string;
  sku?: string | null;
  shortDescription?: string | null;
  category?: string | null;
  brand?: string | null;
  regularPrice: number;
  salePrice?: number | null;
  stockQuantity: number;
  stockStatus?: string | null;
  status?: string | null;
  images?: string[];
  createdAt: string;
  sellerName: string;
  sellerId?: string | null;
};

type RawAdminProduct = Omit<AdminProduct, "sellerName"> & {
  sellerName?: string | null;
  seller?: { id?: string; name?: string | null; email?: string | null } | null;
  createdBy?: { id?: string; name?: string | null; email?: string | null } | null;
};

type AdminProductsResponse = {
  success: boolean;
  message: string;
  data: RawAdminProduct[];
};

const getAuthHeaders = async () => {
  const result = await authClient.getSession();
  const token = result.data?.session?.token;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const getAdminProducts = async () => {
  const response = await apiGet<AdminProductsResponse>(
    "/api/v1/admin/products",
    { headers: await getAuthHeaders() },
  );

  return response.data.map((product) => ({
    ...product,
    sellerName:
      product.sellerName ||
      product.seller?.name ||
      product.createdBy?.name ||
      product.seller?.email ||
      product.createdBy?.email ||
      "Unknown seller",
    sellerId:
      product.seller?.id || product.createdBy?.id || null,
  }));
};

export const deleteAdminProduct = async (productId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/admin/products/${productId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete product");
  }

  return result;
};