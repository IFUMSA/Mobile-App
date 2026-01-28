import api from "@/lib/api";

// Payment Service - matches mobile app services/payment.js

export interface Payment {
    id: string;
    reference: string;
    amount: number;
    title: string;
    status: "pending" | "submitted" | "confirmed" | "completed" | "rejected";
    method?: "card" | "bank";
    date: string;
    proofImage?: string;
}

export const paymentService = {
    // Get user's payment history
    getPaymentHistory: async (status?: string): Promise<{ payments: Payment[] }> => {
        const params = status && status !== "all" ? { status } : {};
        const response = await api.get("/api/payment/history", { params });
        return response.data;
    },

    // Get single payment by ID
    getPaymentById: async (paymentId: string): Promise<{ payment: Payment }> => {
        const response = await api.get(`/api/payment/${paymentId}`);
        return response.data;
    },

    // Create a new payment (initiate checkout)
    createPayment: async (method: "card" | "bank" = "card"): Promise<{ payment: Payment }> => {
        const response = await api.post("/api/payment/create", { method });
        return response.data;
    },

    // Create annual dues payment
    createAnnualDuesPayment: async (method: "card" | "bank" = "bank"): Promise<{ payment: Payment }> => {
        const response = await api.post("/api/payment/annual-dues", { method });
        return response.data;
    },

    // Submit bank transfer proof
    submitPaymentProof: async (paymentId: string, proofImage: string) => {
        const response = await api.post(`/api/payment/${paymentId}/proof`, { proofImage });
        return response.data;
    },

    // Get bank account details for transfer
    getBankDetails: async () => {
        const response = await api.get("/api/payment/bank-details");
        return response.data;
    },
};
