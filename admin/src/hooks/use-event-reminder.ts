"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface SendReminderPayload {
  eventId: string;
  customMessage?: string;
}

interface SendReminderResponse {
  message: string;
  successCount: number;
  failedCount: number;
  errors?: any[];
}

export const useSendEventReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendReminderPayload) => {
      const response = await axios.post(
        `${API_BASE}/api/notifications/admin/send-reminder`,
        payload,
        {
          withCredentials: true,
        }
      );
      return response.data as SendReminderResponse;
    },
    onSuccess: () => {
      // Invalidate any relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
