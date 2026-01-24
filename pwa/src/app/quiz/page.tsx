"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useQuizzes, useQuizCategories } from "@/hooks/use-quiz";
import { HelpCircle, Clock, ChevronRight, Inbox, Loader2 } from "lucide-react";

export default function QuizPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data: categoriesData, isLoading: categoriesLoading } = useQuizCategories();
    const { data: quizzesData, isLoading: quizzesLoading } = useQuizzes(selectedCategory || undefined);

    const categories = categoriesData?.categories || [];
    const quizzes = quizzesData?.quizzes || [];
    const isLoading = categoriesLoading || quizzesLoading;

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Quiz Mode" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen">
            <PageHeader title="Quiz Mode" />

            <div className="flex-1 pt-5">
                {/* Categories */}
                {categories.length > 0 && (
                    <div className="mb-6">
                        <Text variant="body" fontWeight="600" className="mb-3">
                            Categories
                        </Text>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`px-4 py-2 rounded-full border-0 cursor-pointer transition-colors whitespace-nowrap ${selectedCategory === category
                                            ? "bg-[#2A996B] text-white"
                                            : "bg-[#F5F5F5] text-[#1F382E]"
                                        }`}
                                    onClick={() =>
                                        setSelectedCategory(selectedCategory === category ? null : category)
                                    }
                                >
                                    <Text variant="body2" color={selectedCategory === category ? "white" : "textSecondary"}>
                                        {category}
                                    </Text>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Text variant="body" fontWeight="600" className="mb-3">
                    Available Quizzes
                </Text>

                {quizzes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-[60px]">
                        <Inbox size={48} className="text-[#C1C1C1]" />
                        <Text variant="body" color="gray" className="mt-3">
                            No quizzes available
                        </Text>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 pb-5">
                        {quizzes.map((quiz) => (
                            <Link
                                key={quiz.id}
                                href={`/quiz/${quiz.id}`}
                                className="flex items-center p-4 rounded-xl border border-[#D9D9D9] bg-white cursor-pointer hover:shadow-md transition-shadow text-left no-underline"
                            >
                                <div className="flex-1">
                                    <Text variant="body" fontWeight="600" className="mb-1">
                                        {quiz.title}
                                    </Text>
                                    {quiz.description && (
                                        <Text variant="body2" color="gray" className="line-clamp-2">
                                            {quiz.description}
                                        </Text>
                                    )}
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <HelpCircle size={14} className="text-[#C1C1C1]" />
                                            <Text variant="caption" color="gray">
                                                {quiz.questionCount} questions
                                            </Text>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} className="text-[#C1C1C1]" />
                                            <Text variant="caption" color="gray">
                                                {quiz.duration} mins
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={24} className="text-[#C1C1C1]" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
