"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Admin {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface AddAdminPayload {
  email: string;
  firstName: string;
  lastName: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/admin/manage/all`, {
        withCredentials: true,
      });
      return response.data;
    },
  });
};

export const useAddAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddAdminPayload) => {
      const response = await axios.post(
        `${API_BASE}/api/admin/manage/add`,
        payload,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};

export const useRemoveAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const response = await axios.post(
        `${API_BASE}/api/admin/manage/remove`,
        { adminId },
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
};
