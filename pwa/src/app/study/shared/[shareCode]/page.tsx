"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { studyService } from "@/services/study";
import { ChevronLeft, ChevronRight, Check, X, Clock, Loader2 } from "lucide-react";

interface Question {
    id?: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

interface SharedQuiz {
    id: string;
    title: string;
    description?: string;
    duration: number;
    questions: Question[];
    createdBy?: { userName?: string; firstName?: string; lastName?: string };
}

function SharedQuizContent() {
    const router = useRouter();
    const params = useParams();
    const shareCode = params.shareCode as string;

    const [quiz, setQuiz] = useState<SharedQuiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"select" | "practice" | "quiz">("select");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // Fetch shared quiz
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!shareCode) return;
            try {
                setIsLoading(true);
                const { quiz: quizData } = await studyService.getSharedQuiz(shareCode);
                setQuiz(quizData as unknown as SharedQuiz);
                setTimeLeft((quizData.duration || 30) * 60);
            } catch (err) {
                console.error("Failed to fetch shared quiz:", err);
                setError("Quiz not found or no longer shared");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [shareCode]);

    // Timer for quiz mode
    useEffect(() => {
        if (mode === "quiz" && !showResult && timeLeft > 0) {
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
    }, [mode, showResult, timeLeft]);

    const questions = quiz?.questions || [];
    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

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

    const startQuiz = (selectedMode: "practice" | "quiz") => {
        setMode(selectedMode);
        setCurrentIndex(0);
        setAnswers({});
        setShowResult(false);
        setTimeLeft((quiz?.duration || 30) * 60);
    };

    if (isLoading) {
        return (
            <Container className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2A996B]" />
            </Container>
        );
    }

    if (error || !quiz) {
        return (
            <Container className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Text variant="heading2" className="text-center">{error || "Quiz not found"}</Text>
                <Button variant="secondary" onClick={() => router.push("/study")}>
                    Go to Study
                </Button>
            </Container>
        );
    }

    // Mode selection screen
    if (mode === "select") {
        return (
            <Container className="min-h-screen !p-0 flex flex-col">
                <div className="bg-[#1F382E] flex items-center pt-[60px] pb-6 px-4 h-[197px] rounded-b-[48px]">
                    <button
                        onClick={() => router.back()}
                        className="w-11 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer mr-2"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <div className="flex-1">
                        <Text variant="heading2" color="textPrimary" fontWeight="600">
                            {quiz.title}
                        </Text>
                        {quiz.createdBy && (
                            <Text variant="caption" className="text-white/70 mt-1">
                                Shared by {quiz.createdBy.firstName || quiz.createdBy.userName || "User"}
                            </Text>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6">
                    <Text variant="body" color="gray" className="text-center">
                        {questions.length} questions • {quiz.duration} minutes
                    </Text>

                    <div className="flex flex-col gap-4 w-full max-w-sm">
                        <Button
                            variant="outlined"
                            className="w-full py-4"
                            onClick={() => startQuiz("practice")}
                        >
                            Practice Mode {" "}
                            {/* <Text variant="caption" color="gray" className="block mt-1 ml-2">
                                See answers immediately
                            </Text> */}
                        </Button>

                        <Button
                            variant="secondary"
                            className="w-full py-4"
                            onClick={() => startQuiz("quiz")}
                        >
                            Quiz Mode {" "}
                            {/* <Text variant="caption" className="block mt-1 ml-2 text-white/80">
                                Timed with results at end
                            </Text> */}
                        </Button>
                    </div>
                </div>
            </Container>
        );
    }

    // Result screen
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
                    <Button variant="outlined" onClick={() => setMode("select")}>
                        Try Again
                    </Button>
                    <Button variant="secondary" onClick={() => {
                        setShowResult(false);
                        setCurrentIndex(0);
                        setMode("practice"); // Switch to practice mode to show corrections
                    }}>
                        View Corrections
                    </Button>
                </div>
            </Container>
        );
    }

    // Quiz/Practice mode
    return (
        <Container className="min-h-screen !p-0 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D9D9D9]">
                <button onClick={() => setMode("select")} className="p-2 bg-transparent border-0 cursor-pointer">
                    <ChevronLeft size={24} />
                </button>
                <Text variant="body" fontWeight="600">
                    {currentIndex + 1} / {questions.length}
                </Text>
                {mode === "quiz" && (
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
                        const isCorrect = mode === "practice" && isSelected && index === currentQuestion.correctAnswer;
                        const isWrong = mode === "practice" && isSelected && index !== currentQuestion.correctAnswer;

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
                                {mode === "practice" && isSelected && (
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

                {mode === "practice" && (
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

export default function SharedQuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SharedQuizContent />
        </Suspense>
    );
}
