"use client";

import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { usePaymentHistory } from "@/hooks/use-payment";
import { CreditCard, Clock, Check, X, Loader2 } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: { color: "text-yellow-500", icon: <Clock size={16} className="text-yellow-500" /> },
    submitted: { color: "text-blue-500", icon: <Clock size={16} className="text-blue-500" /> },
    confirmed: { color: "text-green-500", icon: <Check size={16} className="text-green-500" /> },
    completed: { color: "text-green-500", icon: <Check size={16} className="text-green-500" /> },
    rejected: { color: "text-red-500", icon: <X size={16} className="text-red-500" /> },
};

const statusFilters = ["all", "pending", "submitted", "confirmed", "completed", "rejected"];

export default function PaymentStatusPage() {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const { data: paymentData, isLoading } = usePaymentHistory(selectedStatus);
    const payments = paymentData?.payments || [];

    const formatPrice = (price: number) => new Intl.NumberFormat("en-NG").format(price);
    const formatDate = (date: string) => new Date(date).toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <Container className="min-h-screen">
            <PageHeader title="Payment Status" />

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                {statusFilters.map((status) => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap border-0 cursor-pointer transition-colors ${selectedStatus === status
                                ? "bg-[#2A996B] text-white"
                                : "bg-[#F5F5F5] text-[#1F382E]"
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                                className="p-4 rounded-xl border border-[#D9D9D9] bg-white"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Text variant="body" fontWeight="600">{payment.title || "Cart Payment"}</Text>
                                    <div className={`flex items-center gap-1 ${config.color}`}>
                                        {config.icon}
                                        <Text variant="caption" className={config.color}>
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </Text>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Text variant="body2" color="gray">₦{formatPrice(payment.amount)}</Text>
                                    <Text variant="caption" color="gray">{formatDate(payment.createdAt)}</Text>
                                </div>
                                <Text variant="caption" color="gray" className="mt-1">
                                    Ref: {payment.reference}
                                </Text>
                            </div>
                        );
                    })}
                </div>
            )}
        </Container>
    );
}
