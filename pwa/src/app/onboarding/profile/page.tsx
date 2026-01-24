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

interface ProfileFormData {
    firstName: string;
    lastName: string;
    level: string;
    faculty: string;
}

const levels = ["100", "200", "300", "400", "500", "600"];
const faculties = ["Medicine", "Dentistry", "Pharmacy", "Nursing"];

export default function OnboardingProfilePage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit } = useForm<ProfileFormData>({
        defaultValues: {
            firstName: "",
            lastName: "",
            level: "",
            faculty: "",
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        try {
            await userService.completeOnboarding(data);
            await refreshUser();
            router.replace("/home");
        } catch (error) {
            console.error("Onboarding error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        setIsLoading(true);
        try {
            await userService.completeOnboarding({ hasCompletedOnboarding: true });
            await refreshUser();
            router.replace("/home");
        } catch (error) {
            console.error("Skip error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="min-h-screen">
            <div className="pt-[72px]">
                <Text variant="heading" className="mb-2">
                    Complete Your Profile
                </Text>
                <Text variant="body2" color="gray">
                    Tell us a bit about yourself
                </Text>
            </div>

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

                <div>
                    <Text variant="body2" className="mb-2">
                        Faculty
                    </Text>
                    <div className="flex flex-wrap gap-2">
                        {faculties.map((faculty) => (
                            <Controller
                                key={faculty}
                                control={control}
                                name="faculty"
                                render={({ field: { onChange, value } }) => (
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-full border transition-colors ${value === faculty
                                                ? "bg-[#2A996B] text-white border-[#2A996B]"
                                                : "bg-white text-[#1F382E] border-[#D9D9D9]"
                                            }`}
                                        onClick={() => onChange(faculty)}
                                    >
                                        {faculty}
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
