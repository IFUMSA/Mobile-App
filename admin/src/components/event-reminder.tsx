"use client";

import React, { useState } from "react";
import { useSendEventReminder } from "@/hooks/use-event-reminder";
import { Bell, AlertCircle, CheckCircle } from "lucide-react";

interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate?: string;
}

interface EventReminderProps {
  events: Event[];
}

export function EventReminder({ events }: EventReminderProps) {
  const sendReminderMutation = useSendEventReminder();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedEventId) {
      setErrorMessage("Please select an event");
      return;
    }

    try {
      const result = await sendReminderMutation.mutateAsync({
        eventId: selectedEventId,
        customMessage: customMessage || undefined,
      });

      setSuccessMessage(
        `Reminder sent successfully! ${result.successCount} users notified. ${
          result.failedCount > 0 ? `${result.failedCount} notifications failed.` : ""
        }`
      );

      // Reset form
      setSelectedEventId("");
      setCustomMessage("");

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Failed to send reminder"
      );
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
        <p>No events available to send reminders for.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Bell size={24} className="text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Send Event Reminder</h2>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <CheckCircle size={20} className="mt-0.5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSendReminder} className="space-y-4">
        {/* Event Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event *
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
                {event.startDate && ` - ${new Date(event.startDate).toLocaleDateString()}`}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter a custom message to include in the reminder. Leave empty to use the default message."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-1">
            {customMessage.length} / 500 characters
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This reminder will be sent to all users both in-app
            and via email. Users will receive a notification about the selected event.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sendReminderMutation.isPending || !selectedEventId}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            {sendReminderMutation.isPending ? "Sending..." : "Send Reminder"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedEventId("");
              setCustomMessage("");
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
