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
        <div className="mt-[72px] flex items-center mb-9 max-w-[600px] mx-auto w-full">
            <button
                onClick={() => router.back()}
                className="w-11 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer"
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
