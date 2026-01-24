"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useUserQuiz } from "@/hooks/use-study";
import { ChevronLeft, ChevronRight, Check, X, Clock } from "lucide-react";

function PracticeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams.get("quizId") || "";
    const mode = searchParams.get("mode") || "practice";

    const { data: quizData, isLoading } = useUserQuiz(quizId);
    const quiz = quizData?.quiz;
    const questions = quiz?.questions || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState((quiz?.duration || 30) * 60);

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const isPracticeMode = mode === "practice";

    // Timer for quiz mode
    useEffect(() => {
        if (!isPracticeMode && !showResult && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setShowResult(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isPracticeMode, showResult, timeLeft]);

    const handleAnswer = (optionIndex: number) => {
        setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setShowResult(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) {
                correct++;
            }
        });
        return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isLoading) {
        return (
            <Container className="min-h-screen flex items-center justify-center">
                <Text>Loading quiz...</Text>
            </Container>
        );
    }

    if (showResult) {
        const score = calculateScore();
        return (
            <Container className="min-h-screen flex flex-col items-center justify-center">
                <Text variant="heading" className="mb-4">Quiz Complete!</Text>
                <div className="w-32 h-32 rounded-full bg-[#2A996B]/10 flex items-center justify-center mb-6">
                    <Text variant="heading" color="secondary" className="text-4xl">{score.percentage}%</Text>
                </div>
                <Text variant="body" color="gray" className="mb-2">
                    You got {score.correct} out of {score.total} correct
                </Text>
                <div className="flex gap-3 mt-8">
                    <Button variant="outlined" onClick={() => router.push("/study/my-questions")}>
                        Back to Questions
                    </Button>
                    <Button variant="secondary" onClick={() => router.push(`/study/corrections?quizId=${quizId}`)}>
                        View Corrections
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen !p-0 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D9D9D9]">
                <button onClick={() => router.back()} className="p-2 bg-transparent border-0 cursor-pointer">
                    <ChevronLeft size={24} />
                </button>
                <Text variant="body" fontWeight="600">
                    {currentIndex + 1} / {questions.length}
                </Text>
                {!isPracticeMode && (
                    <div className="flex items-center gap-1">
                        <Clock size={16} className="text-[#2A996B]" />
                        <Text variant="body2" color="secondary">{formatTime(timeLeft)}</Text>
                    </div>
                )}
            </div>

            {/* Question */}
            <div className="flex-1 p-6">
                <Text variant="body" fontWeight="600" className="mb-6">
                    {currentQuestion?.question}
                </Text>

                <div className="flex flex-col gap-3">
                    {currentQuestion?.options?.map((option, index) => {
                        const isSelected = answers[currentIndex] === index;
                        const isCorrect = isPracticeMode && isSelected && index === currentQuestion.correctAnswer;
                        const isWrong = isPracticeMode && isSelected && index !== currentQuestion.correctAnswer;

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className={`flex items-center p-4 rounded-xl border text-left transition-colors ${isSelected
                                        ? isCorrect
                                            ? "border-green-500 bg-green-50"
                                            : isWrong
                                                ? "border-red-500 bg-red-50"
                                                : "border-[#2A996B] bg-[#2A996B]/10"
                                        : "border-[#D9D9D9] bg-white hover:border-[#2A996B]"
                                    }`}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? "border-[#2A996B] bg-[#2A996B]" : "border-[#D9D9D9]"
                                        }`}
                                >
                                    {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <Text variant="body2">{option}</Text>
                                {isPracticeMode && isSelected && (
                                    <div className="ml-auto">
                                        {isCorrect ? (
                                            <Check size={20} className="text-green-500" />
                                        ) : (
                                            <X size={20} className="text-red-500" />
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {isPracticeMode && answers[currentIndex] !== undefined && (
                    <div className="mt-6 p-4 bg-[#2A996B]/10 rounded-xl">
                        <Text variant="body2" fontWeight="600" color="secondary" className="mb-2">
                            Correct Answer: {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                        </Text>
                        {currentQuestion.explanation && (
                            <Text variant="caption" color="gray">{currentQuestion.explanation}</Text>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 p-6">
                <Button variant="outlined" onClick={handlePrev} disabled={currentIndex === 0} className="flex-1">
                    Previous
                </Button>
                <Button variant="secondary" onClick={handleNext} className="flex-1">
                    {isLastQuestion ? "Finish" : "Next"}
                </Button>
            </div>
        </Container>
    );
}

export default function PracticePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PracticeContent />
        </Suspense>
    );
}
