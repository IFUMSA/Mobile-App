"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { authService } from "@/services/auth";
import { Mail } from "lucide-react";

function VerifyMailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [isResending, setIsResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResend = async () => {
        if (email) {
            setIsResending(true);
            try {
                await authService.resendVerification(email);
                setResent(true);
            } catch (error) {
                console.error("Failed to resend:", error);
            } finally {
                setIsResending(false);
            }
        }
    };

    return (
        <Container className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <Mail size={140} className="text-[#2A996B] mb-6" />

                <Text variant="heading" className="mb-4 text-center">
                    Check your inbox or spam folder
                </Text>

                <Text variant="body" className="text-center mb-2">
                    We&apos;ve sent a verification link to<br />
                    <span className="font-semibold">{email || "your email"}</span>
                </Text>

                <Text variant="body2" color="gray" className="text-center mb-6">
                    Click the link in the email to verify your account, then come back and login.
                </Text>

                {resent && (
                    <Text variant="body2" className="text-[#16a34a] mb-4">
                        Verification email sent!
                    </Text>
                )}

                <div className="w-full flex flex-col gap-3 mt-4">
                    <Button variant="secondary" fullWidth onClick={() => router.push("/login")}>
                        Go to Login
                    </Button>
                    <Button variant="outlined" fullWidth onClick={handleResend} loading={isResending}>
                        Resend Email
                    </Button>
                </div>
            </div>
        </Container>
    );
}

export default function VerifyMailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyMailContent />
        </Suspense>
    );
}
