"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Notification {
    _id: string;
    type: "event" | "payment" | "payment_approval" | "reminder";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    metadata?: any;
}

interface NotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
    total: number;
}

export const notificationKeys = {
    all: ["notifications"] as const,
    list: () => [...notificationKeys.all, "list"] as const,
};

export function useNotifications() {
    return useQuery({
        queryKey: notificationKeys.list(),
        queryFn: async () => {
            const { data } = await api.get<NotificationsResponse>("/api/notifications");
            return data;
        },
        refetchInterval: 30000, // Poll every 30 seconds
    });
}

export function useMarkAsReadMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { data } = await api.put(`/api/notifications/${notificationId}/read`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkAllAsReadMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await api.put("/api/notifications/read-all");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
