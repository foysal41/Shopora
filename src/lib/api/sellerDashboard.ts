import { apiGet } from "@/lib/core/server";

export type SellerDashboardStats = {
  totalSales: number;
  totalOrders: number;
  productsSold: number;
  totalEarnings: number;
  totalProducts: number;
  storeViews: number;
  storeViewsGrowth: number;

  growth: {
    sales: number;
    orders: number;
    productsSold: number;
    earnings: number;
  };

  analytics: {
    topSellingProducts: {
      id: string;
      name: string;
      sold: number;
      revenue: number;
      image: string | null;
    }[];

    ordersOverview: {
      name: string;
      count: number;
      percentage: number;
    }[];

    recentOrders: {
      id: string;
      customer: string;
      amount: number;
      status: string;
      date: string;
    }[];
  };
};

type SellerDashboardResponse = {
  success: boolean;
  message: string;
  data: SellerDashboardStats;
};

export const getSellerDashboardStats = async (
  sellerId: string,
  startDate?: string,
  endDate?: string
): Promise<SellerDashboardStats> => {
  let url = `/api/v1/seller/dashboard/${sellerId}`;

  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }

  const response =
    await apiGet<SellerDashboardResponse>(url);

  return response.data;
};