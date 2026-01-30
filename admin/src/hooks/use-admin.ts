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

export const useAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/manage/all`, {
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
        `/api/admin/manage/add`,
        payload,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch immediately
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
      await queryClient.refetchQueries({ queryKey: ["admins"] });
    },
  });
};

export const useRemoveAdminMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const response = await axios.post(
        `/api/admin/manage/remove`,
        { adminId },
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch immediately
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
      await queryClient.refetchQueries({ queryKey: ["admins"] });
    },
  });
};

