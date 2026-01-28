"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/context/auth-context";
import { userService } from "@/services/user";
import { ChevronLeft } from "lucide-react";

interface ProfileFormData {
    firstName: string;
    lastName: string;
    level: string;
}

const levels = ["100", "200", "300", "400", "500", "600"];

export default function OnboardingProfilePage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit } = useForm<ProfileFormData>({
        defaultValues: {
            firstName: "",
            lastName: "",
            level: "",
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await userService.completeOnboarding(data);
            await refreshUser();
            router.replace("/home");
        } catch (err) {
            console.error("Onboarding error:", err);
            setError("Failed to save profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await userService.completeOnboarding({ hasCompletedOnboarding: true });
            await refreshUser();
            router.replace("/home");
        } catch (err) {
            console.error("Skip error:", err);
            setError("Failed to skip. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="min-h-screen">
            <div className="pt-[56px]">
                <button
                    onClick={() => router.back()}
                    className="w-11 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer mb-4"
                >
                    <ChevronLeft size={24} className="text-[#1F382E]" />
                </button>
                <Text variant="heading" className="mb-2">
                    Complete Your Profile
                </Text>
                <Text variant="body2" color="gray">
                    Tell us a bit about yourself
                </Text>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Text variant="body2" className="text-red-600">{error}</Text>
                </div>
            )}

            <div className="flex flex-col gap-5 mt-8">
                <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="First Name"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            label="First Name"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Last Name"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            label="Last Name"
                        />
                    )}
                />

                <div>
                    <Text variant="body2" className="mb-2">
                        Level
                    </Text>
                    <div className="flex flex-wrap gap-2">
                        {levels.map((level) => (
                            <Controller
                                key={level}
                                control={control}
                                name="level"
                                render={({ field: { onChange, value } }) => (
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-full border transition-colors ${value === level
                                            ? "bg-[#2A996B] text-white border-[#2A996B]"
                                            : "bg-white text-[#1F382E] border-[#D9D9D9]"
                                            }`}
                                        onClick={() => onChange(level)}
                                    >
                                        {level}L
                                    </button>
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex flex-col gap-3">
                <Button variant="secondary" fullWidth onClick={handleSubmit(onSubmit)} loading={isLoading}>
                    Complete Profile
                </Button>
                <Button variant="text" fullWidth onClick={handleSkip} disabled={isLoading}>
                    Skip for now
                </Button>
            </div>
        </Container>
    );
}
