"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAnnouncements } from "@/hooks/use-content";

const fallbackData = [
    {
        id: "0",
        title: "Have You Paid Your Annual Dues?",
        description: "Why Pay Your Annual Dues?",
    },
    {
        id: "1",
        title: "Have Access to The Premium Features",
        description: "Unlock premium quiz features with an annual subscription",
    },
    {
        id: "2",
        title: "Access to The IFUMSA Edu-Stipend Fund",
        description: "Supporting 100 medical students with 20,000 Naira each",
    },
];

export function AnnouncementCarousel() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartRef = useRef<number | null>(null);
    const touchEndRef = useRef<number | null>(null);

    const { data: announcementsData } = useAnnouncements();

    const data = React.useMemo(() => {
        if (announcementsData?.announcements?.length > 0) {
            return announcementsData.announcements.map((item: { _id?: string; title: string; description?: string }, index: number) => ({
                id: item._id || String(index),
                title: item.title,
                description: item.description || "",
            }));
        }
        return fallbackData;
    }, [announcementsData]);

    // Reset auto-scroll timer
    const resetTimer = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % data.length);
        }, 4000);
    }, [data.length]);

    // Auto-scroll
    useEffect(() => {
        resetTimer();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [resetTimer]);

    // Handle swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartRef.current === null || touchEndRef.current === null) return;

        const diff = touchStartRef.current - touchEndRef.current;
        const minSwipeDistance = 50;

        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0) {
                // Swiped left - go next
                setCurrentIndex((prev) => (prev + 1) % data.length);
            } else {
                // Swiped right - go prev
                setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
            }
            resetTimer();
        }

        touchStartRef.current = null;
        touchEndRef.current = null;
    };

    const handlePayNow = async () => {
        setIsCreatingPayment(true);
        try {
            // Navigate to payment method with annual-dues type
            router.push("/payment/method?type=annual-dues");
        } finally {
            setIsCreatingPayment(false);
        }
    };

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
        resetTimer();
    };

    const currentItem = data[currentIndex];

    return (
        <div
            className="bg-white rounded-3xl -mt-[50px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4 pt-[18px] pb-3"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="flex items-start min-h-[100px]">
                {currentIndex !== 0 && (
                    <div className="mr-2">
                        <Text variant="subheading">{currentIndex}.</Text>
                    </div>
                )}
                <div className="flex-1 max-w-[90%]">
                    <Text variant="subheading">{currentItem.title}</Text>
                    <Text variant="caption" className="mt-3.5">
                        {currentItem.description}
                    </Text>
                </div>
            </div>

            <div className="flex justify-between items-center mt-3.5">
                <div className="w-[71px]" />

                {/* Pagination dots */}
                <div className="flex gap-1 mt-2.5">
                    {data.map((_: { id: string; title: string; description: string }, index: number) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-1.5 h-1.5 rounded-full border-0 cursor-pointer transition-colors ${index === currentIndex
                                ? "bg-[#2A996B]"
                                : "bg-[#D9D9D9]/50"
                                }`}
                        />
                    ))}
                </div>

                <Button
                    variant="primary"
                    className="!py-[7px] !px-3.5 !text-[10px]"
                    onClick={handlePayNow}
                    loading={isCreatingPayment}
                >
                    Pay Now
                </Button>
            </div>
        </div>
    );
}
