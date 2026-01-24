"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setApiError(null);

        try {
            await login(data.email, data.password);
            router.replace("/home");
        } catch (error: unknown) {
            const err = error as { message?: string };
            if (err.message?.includes("Not Verified")) {
                setApiError("Please verify your email before logging in");
            } else {
                setApiError(err.message || "Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 pt-[50px]">
            <Text variant="heading">Login</Text>

            {apiError && (
                <Text variant="body2" className="text-[#dc2626] mt-3">
                    {apiError}
                </Text>
            )}

            <div className="flex flex-col gap-8 mt-[30px]">
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

                <div>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                placeholder="Enter Your Password"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                type="password"
                                autoComplete="current-password"
                                label="Password"
                                error={errors.password?.message}
                            />
                        )}
                    />

                    <Link
                        href="/forgot-password"
                        className="block mt-3 text-right no-underline"
                    >
                        <Text variant="body2">Forgot Password?</Text>
                    </Link>
                </div>
            </div>

            <Button
                variant="secondary"
                fullWidth
                className="mt-20"
                onClick={handleSubmit(onSubmit)}
                loading={isLoading}
            >
                Login
            </Button>

            <div className="flex justify-center items-center mt-6 gap-1">
                <Text variant="body2" color="textSecondary">
                    Don&apos;t have an account?
                </Text>
                <Link href="/signup" className="no-underline">
                    <Text variant="body2" color="secondary">
                        Sign up
                    </Text>
                </Link>
            </div>
        </div>
    );
}
