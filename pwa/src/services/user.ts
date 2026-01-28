import api from "@/lib/api";

// User Service - matches mobile app services/user.js

export interface UserProfile {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    bio?: string;
    profilePic?: string;
    level?: string;
    studentClass?: string;
    matricNumber?: string;
    phone?: string;
    hasCompletedOnboarding?: boolean;
}

export const userService = {
    // Get current user profile
    getProfile: async (): Promise<{ user: UserProfile }> => {
        const response = await api.get("/api/user/profile");
        return response.data;
    },

    // Update current user profile
    updateProfile: async (profileData: Partial<UserProfile>): Promise<{ user: UserProfile }> => {
        const response = await api.put("/api/user/profile", profileData);
        return response.data;
    },

    // Complete onboarding (uses updateProfile with hasCompletedOnboarding flag)
    completeOnboarding: async (profileData: Partial<UserProfile>): Promise<{ user: UserProfile }> => {
        const response = await api.put("/api/user/profile", {
            ...profileData,
            hasCompletedOnboarding: true,
        });
        return response.data;
    },

    // Get user by ID (public profile)
    getUserById: async (userId: string): Promise<{ user: UserProfile }> => {
        const response = await api.get(`/api/user/${userId}`);
        return response.data;
    },
};
