"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/services/payment";

// Query keys
export const paymentKeys = {
    all: ["payment"] as const,
    history: (status?: string) => [...paymentKeys.all, "history", status] as const,
    detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
    bankDetails: () => [...paymentKeys.all, "bankDetails"] as const,
};

// Get payment history
export function usePaymentHistory(status = "all") {
    return useQuery({
        queryKey: paymentKeys.history(status),
        queryFn: () => paymentService.getPaymentHistory(status),
    });
}

// Get single payment
export function usePayment(id: string) {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => paymentService.getPaymentById(id),
        enabled: !!id,
    });
}

// Get bank details for transfer
export function useBankDetails() {
    return useQuery({
        queryKey: paymentKeys.bankDetails(),
        queryFn: paymentService.getBankDetails,
    });
}

// Create payment mutation
export function useCreatePaymentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (method: "card" | "bank") => paymentService.createPayment(method),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
    });
}

// Submit payment proof mutation
export function useSubmitProofMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentId, proofImage }: { paymentId: string; proofImage: string }) =>
            paymentService.submitPaymentProof(paymentId, proofImage),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
    });
}

// Create annual dues payment mutation
export function useAnnualDuesMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (method: "card" | "bank" = "bank") =>
            paymentService.createAnnualDuesPayment(method),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
    });
}
