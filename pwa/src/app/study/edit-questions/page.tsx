"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useUserQuiz, useUpdateQuizMutation } from "@/hooks/use-study";
import { ChevronLeft, Trash2, Plus, Loader2 } from "lucide-react";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

function EditQuestionsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams.get("quizId") || "";

    const { data: quizData, isLoading } = useUserQuiz(quizId);
    const updateQuiz = useUpdateQuizMutation();

    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (quizData?.quiz) {
            setTitle(quizData.quiz.title);
            setQuestions(quizData.quiz.questions || []);
        }
    }, [quizData]);

    const handleSave = async () => {
        try {
            await updateQuiz.mutateAsync({
                id: quizId,
                data: { title, questions },
            });
            router.back();
        } catch (error) {
            console.error("Failed to update quiz:", error);
        }
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: string | number | string[]) => {
        setQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
        );
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        setQuestions((prev) =>
            prev.map((q, i) =>
                i === qIndex
                    ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) }
                    : q
            )
        );
    };

    const handleDeleteQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: `new-${Date.now()}`,
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
            },
        ]);
    };

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
                    Edit Questions
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

                {questions.map((question, qIndex) => (
                    <div
                        key={question.id}
                        className="mb-6 p-4 rounded-xl border border-[#D9D9D9] bg-white"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Text variant="body" fontWeight="600">
                                Question {qIndex + 1}
                            </Text>
                            <button
                                onClick={() => handleDeleteQuestion(qIndex)}
                                className="p-1 bg-transparent border-0 cursor-pointer"
                            >
                                <Trash2 size={18} className="text-red-500" />
                            </button>
                        </div>

                        <TextInput
                            value={question.question}
                            onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                            placeholder="Enter question"
                            className="mb-4"
                        />

                        {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2 mb-2">
                                <button
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${question.correctAnswer === oIndex
                                            ? "border-[#2A996B] bg-[#2A996B]"
                                            : "border-[#D9D9D9]"
                                        }`}
                                    onClick={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                                >
                                    {question.correctAnswer === oIndex && (
                                        <span className="text-white text-xs">✓</span>
                                    )}
                                </button>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                    className="flex-1 p-2 border border-[#D9D9D9] rounded-lg focus:border-[#2A996B] focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                ))}

                <button
                    onClick={handleAddQuestion}
                    className="w-full p-4 border-2 border-dashed border-[#D9D9D9] rounded-xl flex items-center justify-center gap-2 bg-transparent cursor-pointer hover:border-[#2A996B] mb-6"
                >
                    <Plus size={20} className="text-[#2A996B]" />
                    <Text variant="body2" color="secondary">
                        Add Question
                    </Text>
                </button>
            </div>

            {/* Footer */}
            <div className="px-6 pt-4 pb-8">
                <Button variant="secondary" fullWidth onClick={handleSave} loading={updateQuiz.isPending}>
                    Save Changes
                </Button>
            </div>
        </Container>
    );
}

export default function EditQuestionsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <EditQuestionsContent />
        </Suspense>
    );
}
