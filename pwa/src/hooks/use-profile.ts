"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, type UserProfile } from "@/services/user";

// Query keys
export const profileKeys = {
    all: ["profile"] as const,
    current: () => [...profileKeys.all, "current"] as const,
    user: (id: string) => [...profileKeys.all, "user", id] as const,
};

// Get current user profile
export function useProfile() {
    return useQuery({
        queryKey: profileKeys.current(),
        queryFn: userService.getProfile,
    });
}

// Get user by ID
export function useUser(userId: string) {
    return useQuery({
        queryKey: profileKeys.user(userId),
        queryFn: () => userService.getUserById(userId),
        enabled: !!userId,
    });
}

// Update profile mutation
export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<UserProfile>) => userService.updateProfile(data),
        onSuccess: (data) => {
            queryClient.setQueryData(profileKeys.current(), data);
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
}

// Complete onboarding mutation
export function useCompleteOnboardingMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<UserProfile>) => userService.completeOnboarding(data),
        onSuccess: (data) => {
            queryClient.setQueryData(profileKeys.current(), data);
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
}
