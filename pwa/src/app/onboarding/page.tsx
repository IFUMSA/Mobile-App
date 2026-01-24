"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Text } from "@/components/ui/text";
import { ChevronRight } from "lucide-react";

const onboardingData = [
    {
        id: 1,
        title: "Prepare for exams with interactive self-assessment quizzes!",
        image: "/images/onboarding-image1.png",
    },
    {
        id: 2,
        title: "Get ready for what's next:\nDiscover upcoming events now!",
        image: "/images/onboarding-image2.png",
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            router.push("/signup");
        }
    };

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
    };

    const currentSlide = onboardingData[currentIndex];

    return (
        <div className="min-h-screen bg-white/90 pt-[50px] flex flex-col">
            <div className="flex-1 h-[80%]">
                {/* Title */}
                <Text
                    variant="subheading"
                    color="textSecondary"
                    className="text-[20px] mb-2.5 px-[30px] whitespace-pre-line"
                >
                    {currentSlide.title}
                </Text>

                {/* Illustration */}
                <div className="flex-1 flex items-center justify-center w-full">
                    <div className="relative w-full h-[400px]">
                        <Image
                            src={currentSlide.image}
                            alt={currentSlide.title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-5 flex justify-center gap-2">
                {onboardingData.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`w-2 h-2 rounded-full border-0 cursor-pointer transition-colors ${index === currentIndex
                                ? "bg-[#1F382E]"
                                : "bg-[#D9D9D9]"
                            }`}
                    />
                ))}
            </div>

            {/* Next button */}
            <div className="flex justify-end mt-6 px-6 pb-10">
                <button
                    onClick={handleNext}
                    className="flex items-center gap-1 bg-transparent border-0 cursor-pointer py-2 px-4"
                >
                    <Text variant="body" fontWeight="500" className="text-[20px]">
                        Next
                    </Text>
                    <ChevronRight size={16} className="text-[#1F382E]" />
                </button>
            </div>
        </div>
    );
}
