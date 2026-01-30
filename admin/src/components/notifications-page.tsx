"use client";

import React, { useState } from "react";
import { useNotifications } from "@/contexts/notification-context";
import { Trash2, Check, CheckCheck, Filter } from "lucide-react";

function formatRelativeTime(date: string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredNotifications = filterType
    ? notifications.filter((n) => n.type === filterType)
    : notifications;

  const getIconForType = (type: string) => {
    switch (type) {
      case "event":
        return "📅";
      case "payment":
        return "💳";
      case "payment_approval":
        return "✅";
      case "reminder":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event":
        return "bg-blue-100 text-blue-800";
      case "payment":
        return "bg-yellow-100 text-yellow-800";
      case "payment_approval":
        return "bg-green-100 text-green-800";
      case "reminder":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? (
              <>You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</>
            ) : (
              <>All caught up!</>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2"
            >
              <CheckCheck size={20} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              filterType === null
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("event")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              filterType === "event"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            📅 Events
          </button>
          <button
            onClick={() => setFilterType("payment")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              filterType === "payment"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            💳 Payments
          </button>
          <button
            onClick={() => setFilterType("payment_approval")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              filterType === "payment_approval"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            ✅ Approvals
          </button>
          <button
            onClick={() => setFilterType("reminder")}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              filterType === "reminder"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            🔔 Reminders
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No notifications{filterType ? " of this type" : ""}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-6 hover:bg-gray-50 transition ${
                    !notif.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="text-3xl shrink-0">
                      {getIconForType(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {notif.title}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(
                                notif.type
                              )}`}
                            >
                              {notif.type.replace("_", " ").toUpperCase()}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0"></span>
                            )}
                          </div>
                          <p className="text-gray-700 mt-2 text-base">
                            {notif.message}
                          </p>

                          {/* Approval Message */}
                          {notif.metadata?.approvalMessage && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm font-medium text-green-900">
                                Next Steps:
                              </p>
                              <p className="text-sm text-green-700 mt-1">
                                {notif.metadata.approvalMessage}
                              </p>
                            </div>
                          )}

                          {/* Item Details */}
                          {notif.metadata?.itemName && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Item:</strong> {notif.metadata.itemName}
                            </p>
                          )}
                          {notif.metadata?.eventName && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Event:</strong> {notif.metadata.eventName}
                            </p>
                          )}

                          <p className="text-xs text-gray-500 mt-3">
                          {formatRelativeTime(notif.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition"
                              title="Mark as read"
                            >
                              <Check size={20} className="text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif._id)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={20} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
