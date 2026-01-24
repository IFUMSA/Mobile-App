"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useProductCategories } from "@/hooks/use-products";
import { ShoppingBag, BookOpen, Loader2 } from "lucide-react";

// Map category values to display names and icons
const categoryConfig: Record<string, { title: string; icon: React.ReactNode }> = {
    Clinical: {
        title: "Clinical Essentials",
        icon: <ShoppingBag size={60} className="text-[#2A996B]" />,
    },
    Merch: {
        title: "Merchandise",
        icon: <ShoppingBag size={60} className="text-[#2A996B]" />,
    },
    Synopsis: {
        title: "Synopses",
        icon: <BookOpen size={60} className="text-[#2A996B]" />,
    },
};

export default function MarketplacePage() {
    const { data: categoriesData, isLoading } = useProductCategories();
    const categories = categoriesData?.categories || [];

    const getCategoryDisplay = (category: string) => {
        const config = categoryConfig[category] || {
            title: category,
            icon: <ShoppingBag size={60} className="text-[#2A996B]" />,
        };
        return config;
    };

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Marketplace" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen">
            <PageHeader title="Marketplace" />

            {categories.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-[60px]">
                    <ShoppingBag size={48} className="text-[#C1C1C1]" />
                    <Text variant="body" color="gray" className="mt-3">
                        No products available yet
                    </Text>
                </div>
            ) : (
                <div className="flex flex-wrap justify-between gap-4 py-6">
                    {categories.map((category) => {
                        const display = getCategoryDisplay(category);
                        return (
                            <Link
                                key={category}
                                href={`/marketplace/${category.toLowerCase()}`}
                                className="w-[48%] rounded-xl p-4 bg-white shadow-md flex flex-col items-center no-underline hover:shadow-lg transition-shadow"
                            >
                                <div className="w-[100px] h-[100px] rounded-lg bg-[#D9D9D9]/30 flex items-center justify-center mb-3">
                                    {display.icon}
                                </div>
                                <Text variant="body" fontWeight="600" align="center" className="mt-2">
                                    {display.title}
                                </Text>
                            </Link>
                        );
                    })}
                </div>
            )}
        </Container>
    );
}
