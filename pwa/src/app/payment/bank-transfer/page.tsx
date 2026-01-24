"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useBankDetails, useSubmitProofMutation } from "@/hooks/use-payment";
import { Copy, Check, Upload, Loader2 } from "lucide-react";

function BankTransferContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("paymentId") || "";
    const amount = searchParams.get("amount") || "0";
    const reference = searchParams.get("reference") || "";

    const { data: bankData, isLoading } = useBankDetails();
    const submitProof = useSubmitProofMutation();

    const [copied, setCopied] = useState<string | null>(null);
    const [proofImage, setProofImage] = useState<string | null>(null);

    const bankDetails = bankData || {
        bankName: "GTBank",
        accountName: "IFUMSA",
        accountNumber: "0123456789",
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProofImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!proofImage) return;
        try {
            await submitProof.mutateAsync({ paymentId, proofImage });
            router.push("/payment/status");
        } catch (error) {
            console.error("Submit error:", error);
        }
    };

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat("en-NG").format(Number(price));
    };

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Bank Transfer" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen flex flex-col">
            <PageHeader title="Bank Transfer" />

            <div className="flex-1">
                <div className="bg-[#2A996B]/10 rounded-xl p-4 mb-6">
                    <Text variant="body2" color="gray" className="mb-1">Amount to Pay</Text>
                    <Text variant="heading2" fontWeight="700">₦{formatPrice(amount)}</Text>
                    <Text variant="caption" color="gray">Reference: {reference}</Text>
                </div>

                <Text variant="body" fontWeight="600" className="mb-4">Transfer to:</Text>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[#D9D9D9] bg-white">
                        <div>
                            <Text variant="caption" color="gray">Bank Name</Text>
                            <Text variant="body">{bankDetails.bankName}</Text>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-[#D9D9D9] bg-white">
                        <div>
                            <Text variant="caption" color="gray">Account Name</Text>
                            <Text variant="body">{bankDetails.accountName}</Text>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-[#D9D9D9] bg-white">
                        <div>
                            <Text variant="caption" color="gray">Account Number</Text>
                            <Text variant="body">{bankDetails.accountNumber}</Text>
                        </div>
                        <button
                            onClick={() => handleCopy(bankDetails.accountNumber, "account")}
                            className="p-2 bg-transparent border-0 cursor-pointer"
                        >
                            {copied === "account" ? (
                                <Check size={20} className="text-[#2A996B]" />
                            ) : (
                                <Copy size={20} className="text-[#2A996B]" />
                            )}
                        </button>
                    </div>
                </div>

                <Text variant="body" fontWeight="600" className="mb-4">Upload Payment Proof</Text>

                <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#D9D9D9] rounded-xl cursor-pointer hover:border-[#2A996B] transition-colors">
                    {proofImage ? (
                        <div className="text-center">
                            <Check size={48} className="text-[#2A996B] mx-auto mb-2" />
                            <Text variant="body2" color="secondary">Proof uploaded</Text>
                        </div>
                    ) : (
                        <>
                            <Upload size={48} className="text-[#C1C1C1] mb-2" />
                            <Text variant="body2" color="gray">Click to upload proof</Text>
                        </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
            </div>

            <div className="pb-8">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!proofImage || submitProof.isPending}
                    loading={submitProof.isPending}
                >
                    Submit Payment Proof
                </Button>
            </div>
        </Container>
    );
}

export default function BankTransferPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <BankTransferContent />
        </Suspense>
    );
}
