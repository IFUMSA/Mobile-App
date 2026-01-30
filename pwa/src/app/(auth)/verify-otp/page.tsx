"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { authService } from "@/services/auth";

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) {
            setError("Please enter the complete 6-digit code");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Call verify OTP API to validate code and get reset token
            const response = await authService.verifyOtp(email, code);
            // Pass the reset token (not the OTP code) to the reset password page
            router.push(`/reset-password?code=${encodeURIComponent(response.resetToken)}`);
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || "Invalid code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="min-h-screen">
            <PageHeader title="Verify Code" />

            <Text variant="body2" className="mb-6">
                Enter the 6-digit code sent to {email}
            </Text>

            {error && (
                <Text variant="body2" className="text-[#dc2626] mb-4">
                    {error}
                </Text>
            )}

            <div className="flex gap-2 justify-center mb-8">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="w-12 h-14 text-center text-xl font-semibold border-2 border-[#D9D9D9] rounded-xl focus:border-[#2A996B] focus:outline-none"
                    />
                ))}
            </div>

            <Button variant="secondary" fullWidth onClick={handleVerify} loading={isLoading}>
                Verify
            </Button>
        </Container>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
