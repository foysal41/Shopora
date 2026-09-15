"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Bell,
    CheckCheck,
    Trash2,
    Package,
    Tag,
    ShieldCheck,
    Info,
    Loader2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
    NotificationItem,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "@/lib/api/notifications";

import Link from "next/link";
import { getUnreadCount } from "@/lib/api/notifications";


const notifyCountChanged = () => {
    window.dispatchEvent(new Event("notifications-updated"));
};

const iconForType = (type: string) => {
    const key = type.toLowerCase();

    if (key.includes("order")) return Package;
    if (key.includes("coupon") || key.includes("discount")) return Tag;
    if (key.includes("security") || key.includes("password")) return ShieldCheck;

    return Info;
};

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
            date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
};

const NotificationsPage = () => {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const data = await getNotifications(userId);
            setNotifications(data);
        } catch (error) {
            console.error("FETCH NOTIFICATIONS ERROR:", error);
            toast.error("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        getNotifications(userId)
            .then((data) => {
                if (!cancelled) setNotifications(data);
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error("FETCH NOTIFICATIONS ERROR:", error);
                    toast.error("Failed to load notifications.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {

        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        notifyCountChanged();

        try {
            await markNotificationAsRead(id);
        } catch (error) {
            // console.error("MARK AS READ ERROR:", error);
            toast.error("Failed to update notification.");
            fetchNotifications();
            notifyCountChanged();
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId || unreadCount === 0) return;

        const previous = notifications;
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        notifyCountChanged();

        try {
            setMarkingAll(true);
            await markAllNotificationsAsRead(userId);
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("MARK ALL AS READ ERROR:", error);
            toast.error("Failed to update notifications.");
            setNotifications(previous); // revert on failure
            notifyCountChanged();
        } finally {
            setMarkingAll(false);
        }
    };

    const handleDelete = async (id: string) => {
        const previous = notifications;
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        notifyCountChanged();

        try {
            await deleteNotification(id);
        } catch (error) {
            console.error("DELETE NOTIFICATION ERROR:", error);
            toast.error("Failed to delete notification.");
            setNotifications(previous); // revert on failure
            notifyCountChanged();
        }
    };

    if (!userId) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-['Poppins']">
                <div className="flex flex-col items-center gap-3 rounded-xl border border-[#E8EEEE] bg-white px-8 py-12 text-center">
                    <Bell size={32} className="text-[#94A3B8]" />
                    <p className="text-[14px] text-[#64748B]">
                        Please log in to view your notifications.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] px-3 py-4 font-['Poppins'] sm:px-5 md:px-6 lg:px-7 xl:px-8">
            {/* Header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-['Poppins'] text-[20px] font-semibold text-[#0F172A]">
                        Notifications
                    </h1>
                    <p className="mt-1 font-['Poppins'] text-[14px] text-[#64748B]">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"
                            }.`
                            : "You're all caught up."}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={markingAll}
                        className="flex items-center justify-center gap-2 rounded-lg border border-[#0F766E] px-4 py-2.5 font-['Poppins'] text-[14px] font-medium text-[#0F766E] transition hover:bg-[#E8F5F3] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {markingAll ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <CheckCheck size={16} />
                        )}
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-20 animate-pulse rounded-xl border border-[#E8EEEE] bg-white"
                        />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && notifications.length === 0 && (
                <div className="rounded-xl border border-[#E8EEEE] bg-white px-6 py-16 text-center">
                    <Bell size={32} className="mx-auto text-[#94A3B8]" />
                    <p className="mt-3 font-['Poppins'] text-[14px] text-[#64748B]">
                        No notifications yet.
                    </p>
                </div>
            )}

            {/* List */}
            {!loading && notifications.length > 0 && (
                <div className="space-y-3">
                    {notifications.map((notification) => {
                        const Icon = iconForType(notification.type);

                        return (
                            <div
                                key={notification.id}
                                className={`flex items-start gap-3 rounded-xl border p-4 transition ${notification.isRead
                                    ? "border-[#E8EEEE] bg-white"
                                    : "border-[#CFE7E4] bg-[#F6FAF9]"
                                    }`}
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.isRead
                                        ? "bg-[#F1F5F9] text-[#94A3B8]"
                                        : "bg-[#E8F5F3] text-[#0F766E]"
                                        }`}
                                >
                                    <Icon size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-['Poppins'] text-[14px] font-semibold text-[#1E293B]">
                                            {notification.title}
                                        </p>

                                        {!notification.isRead && (
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0F766E]" />
                                        )}
                                    </div>

                                    <p className="mt-1 font-['Poppins'] text-[13px] leading-5 text-[#64748B]">
                                        {notification.message}
                                    </p>

                                    <div className="mt-2 flex items-center gap-4">
                                        <span className="font-['Poppins'] text-[12px] text-[#94A3B8]">
                                            {timeAgo(notification.createdAt)}
                                        </span>

                                        {!notification.isRead && (
                                            <button
                                                type="button"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="font-['Poppins'] text-[12px] font-medium text-[#0F766E] hover:underline"
                                            >
                                                Mark as read
                                            </button>
                                        )}

                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                onClick={() => {
                                                    if (!notification.isRead) handleMarkAsRead(notification.id);
                                                }}
                                                className="font-['Poppins'] text-[12px] font-medium text-[#0F766E] hover:underline"
                                            >
                                                Explore →
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(notification.id)}
                                            className="ml-auto flex items-center gap-1 font-['Poppins'] text-[12px] font-medium text-[#94A3B8] transition hover:text-[#FF6B6B]"
                                        >
                                            <Trash2 size={13} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

export default NotificationsPage;