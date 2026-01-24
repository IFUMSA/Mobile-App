"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { ChevronLeft, ChevronRight, Edit3, FileText } from "lucide-react";

interface MenuItem {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    href: string;
}

const menuItems: MenuItem[] = [
    {
        id: "generate",
        title: "Generate Questions",
        subtitle: "Upload your materials and generate questions in preparation for your exams",
        icon: <Edit3 size={24} className="text-[#2A996B]" />,
        href: "/study/generate",
    },
    {
        id: "my-questions",
        title: "My Questions",
        subtitle: "Have access to your previously generated questions here",
        icon: <FileText size={24} className="text-[#2A996B]" />,
        href: "/study/my-questions",
    },
];

export default function StudyPage() {
    const router = useRouter();

    return (
        <Container className="min-h-screen !p-0">
            {/* Header */}
            <div className="bg-[#1F382E] flex items-center pt-[60px] pb-6 px-4 -mx-0 h-[140px]">
                <button
                    onClick={() => router.back()}
                    className="w-11 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer mr-2"
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>
                <Text variant="heading2" color="textPrimary" fontWeight="600">
                    Study
                </Text>
            </div>

            {/* Content */}
            <div className="flex-1 pt-[60px] px-6 flex flex-col gap-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center py-4 px-3 rounded-xl border border-black/[0.02] bg-[#2A996B]/[0.02] no-underline hover:bg-[#2A996B]/[0.05] transition-colors"
                    >
                        <div className="w-[34px] h-[34px] flex items-center justify-center mr-[14px] bg-[#2A996B]/10 rounded">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <Text variant="body" fontWeight="600">
                                {item.title}
                            </Text>
                            <Text variant="caption" color="gray" className="mt-1">
                                {item.subtitle}
                            </Text>
                        </div>
                        <ChevronRight size={24} className="text-[#C1C1C1]" />
                    </Link>
                ))}
            </div>
        </Container>
    );
}
