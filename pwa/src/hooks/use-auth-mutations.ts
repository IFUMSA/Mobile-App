"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth";

// Auth mutations using React Query - matches mobile app hooks/api/use-auth-mutations.js

export function useSignupMutation() {
    return useMutation({
        mutationFn: authService.register,
    });
}

export function useSigninMutation() {
    return useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            authService.login(data),
    });
}

export function useForgotPasswordMutation() {
    return useMutation({
        mutationFn: (email: string) => authService.forgotPassword(email),
    });
}

export function useVerifyResetCodeMutation() {
    return useMutation({
        mutationFn: ({ email, code }: { email: string; code: string }) =>
            authService.verifyOtp(email, code),
    });
}

export function useResetPasswordMutation() {
    return useMutation({
        mutationFn: ({ token, password }: { token: string; password: string }) =>
            authService.resetPassword(token, password),
    });
}

export function useResendVerificationMutation() {
    return useMutation({
        mutationFn: (email: string) => authService.resendVerification(email),
    });
}
