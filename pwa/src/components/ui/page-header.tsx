"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Text } from "./text";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
    title: string;
    isAuth?: boolean;
}

export function PageHeader({ title }: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className="mt-[56px] flex items-center mb-6 max-w-[600px] mx-auto w-full">
            <button
                type="button"
                onClick={() => router.back()}
                className="w-11 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer z-10 relative"
            >
                <ChevronLeft size={24} className="text-black" />
            </button>
            <div className="flex-1 flex items-center justify-center -ml-11">
                <Text variant="heading" className="text-[20px]">
                    {title}
                </Text>
            </div>
        </div>
    );
}
