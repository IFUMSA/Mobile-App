import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as paymentService from '../../services/payment';

// Query keys
export const paymentKeys = {
    all: ['payment'],
    history: (status) => [...paymentKeys.all, 'history', status],
    detail: (id) => [...paymentKeys.all, 'detail', id],
    bankDetails: () => [...paymentKeys.all, 'bankDetails'],
};

// Get payment history
export const usePaymentHistory = (status = 'all') => {
    return useQuery({
        queryKey: paymentKeys.history(status),
        queryFn: () => paymentService.getPaymentHistory(status),
    });
};

// Get single payment
export const usePayment = (id) => {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => paymentService.getPaymentById(id),
        enabled: !!id,
    });
};

// Get bank details for transfer
export const useBankDetails = () => {
    return useQuery({
        queryKey: paymentKeys.bankDetails(),
        queryFn: paymentService.getBankDetails,
    });
};

// Create payment mutation
export const useCreatePaymentMutation = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentService.createPayment,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            options.onSuccess?.(data);
        },
        onError: (error) => {
            options.onError?.(error);
        },
    });
};

// Submit payment proof mutation
export const useSubmitProofMutation = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentId, proofImage }) => 
            paymentService.submitPaymentProof(paymentId, proofImage),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            options.onSuccess?.(data);
        },
        onError: (error) => {
            options.onError?.(error);
        },
    });
};

// Create annual dues payment mutation
export const useAnnualDuesMutation = (options = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: paymentService.createAnnualDuesPayment,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            options.onSuccess?.(data);
        },
        onError: (error) => {
            options.onError?.(error);
        },
    });
};
