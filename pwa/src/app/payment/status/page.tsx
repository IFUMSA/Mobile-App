"use client";

import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { usePaymentHistory } from "@/hooks/use-payment";
import { CreditCard, Clock, Check, X, Loader2, ChevronLeft } from "lucide-react";

interface Payment {
    id: string;
    title?: string;
    amount: number;
    status: string;
    reference: string;
    date: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: "text-yellow-500", icon: <Clock size={16} className="text-yellow-500" />, label: "Pending" },
    submitted: { color: "text-yellow-500", icon: <Clock size={16} className="text-yellow-500" />, label: "Pending" },
    confirmed: { color: "text-green-500", icon: <Check size={16} className="text-green-500" />, label: "Confirmed" },
    completed: { color: "text-green-500", icon: <Check size={16} className="text-green-500" />, label: "Confirmed" },
    rejected: { color: "text-red-500", icon: <X size={16} className="text-red-500" />, label: "Rejected" },
};

// Simplified filters: All, Pending (pending + submitted), Confirmed (confirmed + completed)
const statusFilters = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
];

export default function PaymentStatusPage() {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    // Map our simplified filters to backend statuses
    const backendStatus = selectedStatus === "pending" ? "pending,submitted"
        : selectedStatus === "confirmed" ? "confirmed,completed"
            : "all";

    const { data: paymentData, isLoading } = usePaymentHistory(backendStatus);
    const payments = (paymentData?.payments || []) as Payment[];

    const formatPrice = (price: number) => new Intl.NumberFormat("en-NG").format(price);
    const formatDate = (date: string) => {
        if (!date) return "—";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };
    const formatDateTime = (date: string) => {
        if (!date) return "—";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Container className="min-h-screen">
            <PageHeader title="Payment History" />

            {/* Filter tabs - Simplified to 3 */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setSelectedStatus(filter.key)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap border-0 cursor-pointer transition-colors ${selectedStatus === filter.key
                            ? "bg-[#2A996B] text-white"
                            : "bg-[#F5F5F5] text-[#1F382E]"
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center pt-[100px]">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            ) : payments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-[60px]">
                    <CreditCard size={48} className="text-[#C1C1C1]" />
                    <Text variant="body" color="gray" className="mt-3">
                        No {selectedStatus === "all" ? "" : selectedStatus} payments
                    </Text>
                </div>
            ) : (
                <div className="flex flex-col gap-3 mt-4">
                    {payments.map((payment) => {
                        const config = statusConfig[payment.status] || statusConfig.pending;
                        return (
                            <div
                                key={payment.id}
                                onClick={() => setSelectedPayment(payment)}
                                className="p-4 rounded-xl border border-[#D9D9D9] bg-white cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Text variant="body" fontWeight="600">{payment.title || "Cart Payment"}</Text>
                                    <div className={`flex items-center gap-1 ${config.color}`}>
                                        {config.icon}
                                        <Text variant="caption" className={config.color}>
                                            {config.label}
                                        </Text>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Text variant="body2" color="gray">₦{formatPrice(payment.amount)}</Text>
                                    <Text variant="caption" color="gray">{formatDate(payment.date)}</Text>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelectedPayment(null)}>
                    <div className="w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setSelectedPayment(null)} className="p-1 bg-transparent border-0 cursor-pointer">
                                <ChevronLeft size={24} className="text-[#1F382E]" />
                            </button>
                            <Text variant="body" fontWeight="600">Payment Details</Text>
                            <div className="w-6" />
                        </div>

                        <div className="space-y-4">
                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                                <Text variant="body2" color="gray">Status</Text>
                                <div className={`flex items-center gap-1 ${statusConfig[selectedPayment.status]?.color || "text-gray-500"}`}>
                                    {statusConfig[selectedPayment.status]?.icon}
                                    <Text variant="body2" fontWeight="500" className={statusConfig[selectedPayment.status]?.color}>
                                        {statusConfig[selectedPayment.status]?.label || selectedPayment.status}
                                    </Text>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                                <Text variant="body2" color="gray">Amount</Text>
                                <Text variant="body" fontWeight="600">₦{formatPrice(selectedPayment.amount)}</Text>
                            </div>

                            {/* Reference */}
                            <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                                <Text variant="body2" color="gray">Reference</Text>
                                <Text variant="body2" fontWeight="500" className="text-right max-w-[200px] break-all">
                                    {selectedPayment.reference}
                                </Text>
                            </div>

                            {/* Date */}
                            <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                                <Text variant="body2" color="gray">Date</Text>
                                <Text variant="body2" fontWeight="500">{formatDateTime(selectedPayment.date)}</Text>
                            </div>

                            {/* Title/Description */}
                            {selectedPayment.title && (
                                <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                                    <Text variant="body2" color="gray">Description</Text>
                                    <Text variant="body2" fontWeight="500">{selectedPayment.title}</Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
}
