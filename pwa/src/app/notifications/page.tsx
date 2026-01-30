"use client";

import React from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useNotifications, useMarkAsReadMutation, useMarkAllAsReadMutation } from "@/hooks/use-notifications";
import {
    Bell,
    CheckCircle,
    Calendar,
    CreditCard,
    Info,
    Loader2,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper for relative time (e.g., "5 minutes ago")
function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";

    // Intl.RelativeTimeFormat is supported in modern browsers
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return rtf.format(-years, "year");
    if (months > 0) return rtf.format(-months, "month");
    if (weeks > 0) return rtf.format(-weeks, "week");
    if (days > 0) return rtf.format(-days, "day");
    if (hours > 0) return rtf.format(-hours, "hour");
    return rtf.format(-minutes, "minute");
}

export default function NotificationsPage() {
    const { data, isLoading } = useNotifications();
    const markAsRead = useMarkAsReadMutation();
    const markAllAsRead = useMarkAllAsReadMutation();

    const notifications = data?.notifications || [];
    const unreadCount = data?.unreadCount || 0;

    const handleMarkAsRead = (id: string, isRead: boolean) => {
        if (!isRead) {
            markAsRead.mutate(id);
        }
    };

    const handleMarkAllRead = () => {
        markAllAsRead.mutate();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "payment":
            case "payment_approval":
                return <CreditCard size={20} className="text-[#2A996B]" />;
            case "event":
                return <Calendar size={20} className="text-[#F79E1B]" />;
            case "reminder":
                return <Bell size={20} className="text-[#5B4DFF]" />;
            default:
                return <Info size={20} className="text-[#1F382E]" />;
        }
    };

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Notifications" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen pb-20">
            <div className="relative">
                <PageHeader title="Notifications" />

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markAllAsRead.isPending}
                        className="absolute right-0 top-[60px] flex items-center gap-1 text-sm text-[#2A996B] font-medium bg-transparent border-0 cursor-pointer"
                    >
                        <Check size={16} />
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-[100px] text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
                        <Bell size={32} className="text-[#A0A0A0]" />
                    </div>
                    <Text variant="heading3" className="mb-2">No Notifications</Text>
                    <Text variant="body" color="gray">You&apos;re all caught up! Check back later for updates.</Text>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={cn(
                                "relative p-4 rounded-xl border transition-all duration-200",
                                notification.isRead
                                    ? "bg-white border-[#E5E5E5]"
                                    : "bg-[#F0FDF4] border-[#2A996B]/30"
                            )}
                            onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
                        >
                            {!notification.isRead && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#F84F4F]" />
                            )}

                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                    notification.isRead ? "bg-[#F5F5F5]" : "bg-white shadow-sm"
                                )}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1 pr-4">
                                        <Text variant="body" fontWeight={notification.isRead ? "500" : "600"} className="line-clamp-1">
                                            {notification.title}
                                        </Text>
                                    </div>

                                    <Text variant="caption" color="textSecondary" className="line-clamp-2 mb-2 leading-relaxed">
                                        {notification.message}
                                    </Text>

                                    <Text variant="caption" color="gray" className="text-[10px] uppercase tracking-wider">
                                        {getRelativeTime(notification.createdAt)}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Container>
    );
}
