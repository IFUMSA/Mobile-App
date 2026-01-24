"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { authService } from "@/services/auth";

const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange",
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: ForgotPasswordData) => {
        setIsLoading(true);
        setApiError(null);
        try {
            await authService.forgotPassword(data.email);
            router.push(`/verify-otp?email=${encodeURIComponent(getValues("email"))}`);
        } catch (error: unknown) {
            const err = error as { message?: string };
            setApiError(err.message || "Failed to send code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="min-h-screen">
            <PageHeader title="Forgot Password?" />
            <Text variant="body2">
                Fill in your email and we&apos;ll send a code to reset your password
            </Text>

            {apiError && (
                <Text variant="body2" className="text-[#dc2626] mt-3">
                    {apiError}
                </Text>
            )}

            <div className="flex flex-col gap-8 mt-6">
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Enter Your Email"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            type="email"
                            error={errors.email?.message}
                        />
                    )}
                />
            </div>

            <Button
                variant="secondary"
                fullWidth
                className="mt-20"
                onClick={handleSubmit(onSubmit)}
                loading={isLoading}
            >
                Send code
            </Button>
        </Container>
    );
}
