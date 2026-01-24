"use client";

import React from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { BookOpen, ShoppingBag, Calendar } from "lucide-react";

interface NavLink {
    label: string;
    icon: React.ReactNode;
    href: string;
}

const links: NavLink[] = [
    {
        label: "Study",
        icon: <BookOpen size={54} className="text-[#2A996B]" />,
        href: "/study",
    },
    {
        label: "Marketplace",
        icon: <ShoppingBag size={54} className="text-[#2A996B]" />,
        href: "/marketplace",
    },
    {
        label: "Events",
        icon: <Calendar size={54} className="text-[#2A996B]" />,
        href: "/events",
    },
];

export function NavigationLinks() {
    return (
        <div className="mt-9">
            <Text variant="heading2" fontWeight="600" className="text-[20px] mb-1">
                Features
            </Text>
            <div className="flex justify-between gap-6">
                {links.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="flex-1 flex flex-col items-center justify-between gap-[6px] rounded-xl px-3 py-4 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden no-underline"
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-[#2A996B]/[0.02] rounded-xl pointer-events-none" />

                        <Text variant="caption" align="center" className="whitespace-nowrap relative z-10">
                            {link.label}
                        </Text>
                        <div className="relative z-10">
                            {link.icon}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
