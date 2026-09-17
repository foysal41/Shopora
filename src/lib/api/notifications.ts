import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null; 
  isRead: boolean;
  createdAt: string;
}

const getAuthHeaders = async () => {
  const result = await authClient.getSession();
  const token = result.data?.session?.token;

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const notificationRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
      ...options.headers,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Notification request failed");
  }

  return result.data as T;
};

export async function getNotifications(
  userId: string
): Promise<NotificationItem[]> {
  return notificationRequest<NotificationItem[]>(
    `/api/v1/notifications/${userId}`,
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  const data = await notificationRequest<{ count: number }>(
    `/api/v1/notifications/${userId}/unread-count`,
  );

  return data.count;
}

export async function markNotificationAsRead(id: string) {
  return notificationRequest(`/api/v1/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return notificationRequest(`/api/v1/notifications/${userId}/read-all`, {
    method: "PATCH",
  });
}

export async function deleteNotification(id: string) {
  return notificationRequest(`/api/v1/notifications/${id}`, {
    method: "DELETE",
  });
}