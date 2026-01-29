"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useCreatePaymentMutation, useAnnualDuesMutation } from "@/hooks/use-payment";
import { Briefcase, Loader2 } from "lucide-react";

interface PaymentMethodOption {
    id: "card" | "bank";
    label: string;
    icon: React.ReactNode;
    description: string;
}

const paymentMethods: PaymentMethodOption[] = [
    {
        id: "bank",
        label: "Bank Transfer",
        icon: <Briefcase size={22} />,
        description: "Pay via bank transfer",
    },
];

function PaymentMethodContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentType = searchParams.get("type"); // "annual-dues" or null (cart checkout)

    const [selectedMethod, setSelectedMethod] = useState<"card" | "bank">("bank");
    const createPayment = useCreatePaymentMutation();
    const createAnnualDues = useAnnualDuesMutation();
    const [error, setError] = useState<string | null>(null);

    const isAnnualDues = paymentType === "annual-dues";

    const handleContinue = async () => {
        setError(null);
        try {
            // Call the appropriate endpoint based on payment type
            const result = isAnnualDues
                ? await createAnnualDues.mutateAsync(selectedMethod)
                : await createPayment.mutateAsync(selectedMethod);

            if (result.payment) {
                const params = new URLSearchParams({
                    paymentId: result.payment.id,
                    reference: result.payment.reference,
                    amount: String(result.payment.amount),
                });

                if (selectedMethod === "card") {
                    router.push("/payment/add-card");
                } else {
                    router.push(`/payment/bank-transfer?${params.toString()}`);
                }
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || "Failed to create payment. Please try again.");
        }
    };

    const isPending = createPayment.isPending || createAnnualDues.isPending;

    return (
        <Container className="min-h-screen flex flex-col">
            <PageHeader title="Payment Method" />

            <div className="flex-1 pt-5">
                <Text variant="body" fontWeight="600" className="mb-4">
                    Choose Payment Option
                </Text>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <Text variant="body2" className="text-red-600">{error}</Text>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {paymentMethods.map((method) => {
                        const isSelected = selectedMethod === method.id;

                        return (
                            <button
                                key={method.id}
                                className={`flex items-center justify-between p-4 rounded-xl border-[1.5px] text-left cursor-pointer transition-colors ${isSelected
                                    ? "border-[#2A996B] bg-[#2A996B]/5"
                                    : "border-[#D9D9D9] bg-white"
                                    }`}
                                onClick={() => setSelectedMethod(method.id)}
                            >
                                <div className="flex items-center flex-1">
                                    <div
                                        className={`w-11 h-11 rounded-full flex items-center justify-center mr-3 ${isSelected ? "bg-[#2A996B]/10" : "bg-[#D9D9D9]"
                                            }`}
                                    >
                                        <span className={isSelected ? "text-[#2A996B]" : "text-[#C1C1C1]"}>
                                            {method.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <Text variant="body" fontWeight="500">
                                            {method.label}
                                        </Text>
                                        <Text variant="caption" color="gray">
                                            {method.description}
                                        </Text>
                                    </div>
                                </div>
                                <div
                                    className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#2A996B]" : "border-[#C1C1C1]"
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="w-3 h-3 rounded-full bg-[#2A996B]" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="pt-4 pb-6">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleContinue}
                    loading={isPending}
                >
                    Continue
                </Button>
            </div>
        </Container>
    );
}

export default function PaymentMethodPage() {
    return (
        <Suspense fallback={
            <Container className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
            </Container>
        }>
            <PaymentMethodContent />
        </Suspense>
    );
}
