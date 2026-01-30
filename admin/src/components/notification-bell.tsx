"use client";

import React, { useState } from "react";
import { Bell, X, Check, CheckCheck, Trash2, Mail, AlertCircle } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";

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

export function NotificationBell() {
  const { unreadCount, notifications, markAsRead, deleteNotification } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertCircle size={40} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                    !notif.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="text-2xl shrink-0 mt-1">
                      {getIconForType(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(notif.createdAt)}
                      </p>

                      {/* Approval Message */}
                      {notif.metadata?.approvalMessage && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                          {notif.metadata.approvalMessage}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notif._id)}
                          className="p-1 hover:bg-gray-200 rounded transition"
                          title="Mark as read"
                        >
                          <Check size={16} className="text-blue-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, notif._id)}
                        className="p-1 hover:bg-gray-200 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <a
                href="/notifications"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All Notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
