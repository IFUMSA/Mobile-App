"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { authService } from "@/services/auth";

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("code") || "";

    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        defaultValues: { password: "", confirmPassword: "" },
    });

    const onSubmit = async (data: ResetPasswordData) => {
        setIsLoading(true);
        setApiError(null);
        try {
            await authService.resetPassword(token, data.password);
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: unknown) {
            const err = error as { message?: string };
            setApiError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <Container className="min-h-screen flex flex-col items-center justify-center">
                <Text variant="heading" className="text-center mb-4">
                    Password Reset!
                </Text>
                <Text variant="body" color="gray" className="text-center">
                    Redirecting to login...
                </Text>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen">
            <PageHeader title="Reset Password" />
            <Text variant="body2">Enter your new password</Text>

            {apiError && (
                <Text variant="body2" className="text-[#dc2626] mt-3">
                    {apiError}
                </Text>
            )}

            <div className="flex flex-col gap-6 mt-6">
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Enter new password"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            type="password"
                            label="New Password"
                            error={errors.password?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Confirm new password"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            type="password"
                            label="Confirm Password"
                            error={errors.confirmPassword?.message}
                        />
                    )}
                />
            </div>

            <Button
                variant="secondary"
                fullWidth
                className="mt-12"
                onClick={handleSubmit(onSubmit)}
                loading={isLoading}
            >
                Reset Password
            </Button>
        </Container>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
