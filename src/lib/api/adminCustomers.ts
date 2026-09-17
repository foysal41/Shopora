import { authClient } from "@/lib/auth-client";
import { apiDelete, apiGet, apiPatch } from "@/lib/core/server";

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  orderCount?: number;
};

type CustomersResponse = {
  success: boolean;
  message: string;
  data: AdminCustomer[];
};

const authHeaders = async () => {
  const result = await authClient.getSession();
  const token = result.data?.session?.token;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const getAdminCustomers = async () => {
  const response = await apiGet<CustomersResponse>(
    "/api/v1/admin/customers",
    { headers: await authHeaders() },
  );
  return response.data;
};

export const setCustomerBlocked = async (
  customerId: string,
  isBlocked: boolean,
) => {
  await apiPatch(
    `/api/v1/admin/customers/${customerId}/status`,
    { isBlocked },
    { headers: await authHeaders() },
  );
};

export const deleteAdminCustomer = async (customerId: string) => {
  await apiDelete(
    `/api/v1/admin/customers/${customerId}`,
    { headers: await authHeaders() },
  );
};