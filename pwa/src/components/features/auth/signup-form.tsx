"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { signupSchema, type SignupFormData } from "@/lib/validations";
import { ArrowLeft } from "lucide-react";

export function SignupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        setApiError(null);

        try {
            await authService.register({
                email: data.email,
                password: data.password,
                userName: data.userName,
                firstName: data.firstName,
                lastName: data.lastName,
            });
            setSuccess(true);
            // Redirect to verify-mail screen
            router.push(`/verify-mail?email=${encodeURIComponent(data.email)}`);
        } catch (error: unknown) {
            const err = error as { message?: string };
            setApiError(err.message || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 pt-6">
            <Link
                href="/login"
                className="flex items-center gap-2 no-underline mb-4"
            >
                <ArrowLeft size={24} className="text-[#1F382E]" />
                <Text variant="body2" color="primary">
                    Back to Login
                </Text>
            </Link>

            <Text variant="heading">Sign up</Text>

            {success ? (
                <Text variant="body2" className="text-[#16a34a] mt-3">
                    Account created! Redirecting to login...
                </Text>
            ) : (
                apiError && (
                    <Text variant="body2" className="text-[#dc2626] mt-3">
                        {apiError}
                    </Text>
                )
            )}

            <div className="flex flex-col gap-5 mt-5">
                {/* Name row */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Controller
                            control={control}
                            name="firstName"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder="First Name"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    label="First Name"
                                    error={errors.firstName?.message}
                                />
                            )}
                        />
                    </div>
                    <div className="flex-1">
                        <Controller
                            control={control}
                            name="lastName"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder="Last Name"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    label="Last Name"
                                    error={errors.lastName?.message}
                                />
                            )}
                        />
                    </div>
                </div>

                <Controller
                    control={control}
                    name="userName"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Choose a username"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            autoComplete="username"
                            label="Username"
                            error={errors.userName?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Enter Your Email"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            type="email"
                            autoComplete="email"
                            label="Email"
                            error={errors.email?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Enter Your Password"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            label="Password"
                            error={errors.password?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Re-enter your Password"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            label="Confirm Password"
                            error={errors.confirmPassword?.message}
                        />
                    )}
                />
            </div>

            <Button
                variant="secondary"
                fullWidth
                className="mt-10"
                onClick={handleSubmit(onSubmit)}
                loading={isLoading}
            >
                Sign up
            </Button>
        </div>
    );
}
