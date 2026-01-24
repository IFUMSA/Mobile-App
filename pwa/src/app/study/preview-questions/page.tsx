"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useSaveQuizMutation } from "@/hooks/use-study";
import { ChevronLeft, Check, X, Edit3 } from "lucide-react";

interface GeneratedQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

function PreviewQuestionsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const questionsParam = searchParams.get("questions") || "[]";
    const topic = searchParams.get("topic") || "Untitled Quiz";
    const questionType = searchParams.get("questionType") || "mcq";
    const duration = searchParams.get("duration") || "30";

    const [questions, setQuestions] = useState<GeneratedQuestion[]>(() => {
        try {
            return JSON.parse(questionsParam);
        } catch {
            return [];
        }
    });
    const [title, setTitle] = useState(topic);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const saveQuiz = useSaveQuizMutation();

    const handleSave = async () => {
        try {
            await saveQuiz.mutateAsync({
                title,
                questions,
                questionType,
                duration: parseInt(duration, 10),
            });
            router.push("/study/my-questions");
        } catch (error) {
            console.error("Failed to save quiz:", error);
        }
    };

    const handleDeleteQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEditQuestion = (index: number, updatedQuestion: GeneratedQuestion) => {
        setQuestions((prev) => prev.map((q, i) => (i === index ? updatedQuestion : q)));
        setEditingIndex(null);
    };

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
                    Preview Questions
                </Text>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pt-6 overflow-y-auto">
                <div className="mb-6">
                    <Text variant="body2" fontWeight="500" className="mb-2">
                        Quiz Title
                    </Text>
                    <TextInput
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter quiz title"
                    />
                </div>

                <Text variant="body" fontWeight="600" className="mb-4">
                    {questions.length} Questions Generated
                </Text>

                <div className="flex flex-col gap-4 pb-6">
                    {questions.map((question, index) => (
                        <div
                            key={question.id || index}
                            className="p-4 rounded-xl border border-[#D9D9D9] bg-white"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Text variant="body" fontWeight="600" className="flex-1">
                                    Q{index + 1}. {question.question}
                                </Text>
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={() => setEditingIndex(index)}
                                        className="p-1 bg-transparent border-0 cursor-pointer"
                                    >
                                        <Edit3 size={16} className="text-[#2A996B]" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(index)}
                                        className="p-1 bg-transparent border-0 cursor-pointer"
                                    >
                                        <X size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {question.options.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className={`flex items-center gap-2 p-2 rounded-lg ${optIndex === question.correctAnswer
                                                ? "bg-green-50 border border-green-300"
                                                : "bg-gray-50"
                                            }`}
                                    >
                                        <span
                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${optIndex === question.correctAnswer
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-300"
                                                }`}
                                        >
                                            {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <Text variant="body2" className="flex-1">
                                            {option}
                                        </Text>
                                        {optIndex === question.correctAnswer && (
                                            <Check size={16} className="text-green-500" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {question.explanation && (
                                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                    <Text variant="caption" color="gray">
                                        <strong>Explanation:</strong> {question.explanation}
                                    </Text>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pt-4 pb-8">
                <Button variant="outlined" className="flex-1" onClick={() => router.back()}>
                    Regenerate
                </Button>
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleSave}
                    loading={saveQuiz.isPending}
                    disabled={questions.length === 0}
                >
                    Save Quiz
                </Button>
            </div>
        </Container>
    );
}

export default function PreviewQuestionsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PreviewQuestionsContent />
        </Suspense>
    );
}
