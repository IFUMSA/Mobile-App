"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Notification {
  _id: string;
  type: "event" | "payment" | "payment_approval" | "reminder";
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    eventId?: string;
    paymentId?: string;
    approvalMessage?: string;
    eventName?: string;
    itemName?: string;
  };
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/api/notifications`, {
        withCredentials: true,
      });

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.put(
        `${API_BASE}/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(
        `${API_BASE}/api/notifications/read-all`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await axios.delete(`${API_BASE}/api/notifications/${notificationId}`, {
        withCredentials: true,
      });

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      setUnreadCount((prev) =>
        prev > 0 &&
        notifications.find((n) => n._id === notificationId && !n.isRead)
          ? prev - 1
          : prev
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  }, [notifications]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
