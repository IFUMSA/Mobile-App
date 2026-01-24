"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/context/auth-context";
import { Mail, User, Edit2, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const { user: authUser, isLoading: authLoading } = useAuth();
    const { data: profileData, isLoading: profileLoading } = useProfile();

    const isLoading = authLoading || profileLoading;
    const user = profileData?.user || authUser;

    const displayName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
        : "Loading...";

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Profile" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen">
            <PageHeader title="Profile" />

            <div className="flex-1">
                {/* Profile Header */}
                <div className="flex flex-col items-center py-6">
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden mb-4 bg-[#D9D9D9]">
                        {user?.profilePic ? (
                            <Image
                                src={user.profilePic}
                                alt="Profile"
                                width={100}
                                height={100}
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User size={48} className="text-[#1F382E]" />
                            </div>
                        )}
                    </div>
                    <Text variant="heading3" fontWeight="600" className="mb-1">
                        {displayName}
                    </Text>
                    {user?.userName && (
                        <Text variant="body2" color="gray">
                            @{user.userName}
                        </Text>
                    )}
                    {user?.bio && (
                        <Text variant="body2" color="textSecondary" className="mt-2 text-center px-8">
                            {user.bio}
                        </Text>
                    )}
                </div>

                {/* Profile Info Cards */}
                <div className="flex flex-col gap-3 mb-6">
                    <div className="p-4 rounded-xl border border-[#D9D9D9] bg-white">
                        <div className="flex items-center">
                            <Mail size={20} className="text-[#C1C1C1]" />
                            <div className="ml-3">
                                <Text variant="caption" color="gray">
                                    Email
                                </Text>
                                <Text variant="body2">{user?.email || "-"}</Text>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-[#D9D9D9] bg-white">
                        <div className="flex items-center">
                            <User size={20} className="text-[#C1C1C1]" />
                            <div className="ml-3">
                                <Text variant="caption" color="gray">
                                    Username
                                </Text>
                                <Text variant="body2">{user?.userName || "-"}</Text>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Options */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/profile/edit"
                        className="flex items-center justify-between p-4 rounded-xl border border-[#D9D9D9] bg-white no-underline hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <Edit2 size={20} className="text-[#2A996B]" />
                            <Text variant="body" className="ml-3">
                                Edit Profile
                            </Text>
                        </div>
                        <ChevronRight size={20} className="text-[#C1C1C1]" />
                    </Link>

                    <Link
                        href="/payment/status"
                        className="flex items-center justify-between p-4 rounded-xl border border-[#D9D9D9] bg-white no-underline hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <CreditCard size={20} className="text-[#2A996B]" />
                            <Text variant="body" className="ml-3">
                                Payment History
                            </Text>
                        </div>
                        <ChevronRight size={20} className="text-[#C1C1C1]" />
                    </Link>
                </div>
            </div>
        </Container>
    );
}
