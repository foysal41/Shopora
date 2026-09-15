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

export async function getNotifications(
  userId: string
): Promise<NotificationItem[]> {
  const response = await fetch(`${API_URL}/api/v1/notifications/${userId}`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch notifications");
  }

  return result.data;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const response = await fetch(
    `${API_URL}/api/v1/notifications/${userId}/unread-count`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch unread count");
  }

  return result.data.count;
}

export async function markNotificationAsRead(id: string) {
  const response = await fetch(
    `${API_URL}/api/v1/notifications/${id}/read`,
    {
      method: "PATCH",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update notification");
  }

  return result.data;
}

export async function markAllNotificationsAsRead(userId: string) {
  const response = await fetch(
    `${API_URL}/api/v1/notifications/${userId}/read-all`,
    {
      method: "PATCH",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update notifications");
  }

  return result.data;
}

export async function deleteNotification(id: string) {
  const response = await fetch(`${API_URL}/api/v1/notifications/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete notification");
  }

  return result.data;
}