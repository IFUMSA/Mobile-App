"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useUserQuiz } from "@/hooks/use-study";
import { ChevronLeft, Check, X, Loader2 } from "lucide-react";

function CorrectionsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams.get("quizId") || "";

    const { data: quizData, isLoading } = useUserQuiz(quizId);
    const quiz = quizData?.quiz;
    const questions = quiz?.questions || [];

    if (isLoading) {
        return (
            <Container className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
            </Container>
        );
    }

    return (
        <Container className="min-h-screen !p-0 flex flex-col">
            {/* Header */}
            <div className="bg-[#1F382E] flex items-center pt-[60px] pb-6 px-4 h-[197px] rounded-b-[48px]">
                <button
                    onClick={() => router.back()}
                    className="w-11 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer mr-2"
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>
                <Text variant="heading2" color="textPrimary" fontWeight="600">
                    Corrections
                </Text>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pt-6 overflow-y-auto">
                <Text variant="body" fontWeight="600" className="mb-4">
                    {quiz?.title || "Quiz"} - All Answers
                </Text>

                <div className="flex flex-col gap-4 pb-6">
                    {questions.map((question, index) => (
                        <div
                            key={question.id || index}
                            className="p-4 rounded-xl border border-[#D9D9D9] bg-white"
                        >
                            <Text variant="body" fontWeight="600" className="mb-3">
                                Q{index + 1}. {question.question}
                            </Text>

                            <div className="flex flex-col gap-2">
                                {question.options.map((option, optIndex) => {
                                    const isCorrect = optIndex === question.correctAnswer;

                                    return (
                                        <div
                                            key={optIndex}
                                            className={`flex items-center gap-2 p-3 rounded-lg ${isCorrect ? "bg-green-50 border border-green-300" : "bg-gray-50"
                                                }`}
                                        >
                                            <span
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isCorrect ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                                                    }`}
                                            >
                                                {String.fromCharCode(65 + optIndex)}
                                            </span>
                                            <Text variant="body2" className="flex-1">
                                                {option}
                                            </Text>
                                            {isCorrect && <Check size={18} className="text-green-500" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <Text variant="caption" fontWeight="600" className="text-blue-700 mb-1">
                                        Explanation
                                    </Text>
                                    <Text variant="body2" className="text-blue-600">
                                        {question.explanation}
                                    </Text>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pt-4 pb-8">
                <Button variant="secondary" fullWidth onClick={() => router.push("/study/my-questions")}>
                    Back to My Questions
                </Button>
            </div>
        </Container>
    );
}

export default function CorrectionsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CorrectionsContent />
        </Suspense>
    );
}
