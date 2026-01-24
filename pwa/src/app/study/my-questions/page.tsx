"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useUserQuizzes, useDeleteQuizMutation } from "@/hooks/use-study";
import { ChevronLeft, FileText, MoreVertical, Clock, Edit2, Download, Share2, Trash2, BookOpen, HelpCircle, Loader2, AlertCircle } from "lucide-react";

export default function MyQuestionsPage() {
    const router = useRouter();
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showModeModal, setShowModeModal] = useState(false);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);

    const { data: quizzesData, isLoading, error, refetch } = useUserQuizzes();
    const deleteQuiz = useDeleteQuizMutation();
    const quizzes = quizzesData?.quizzes || [];

    const handleQuizPress = (quizId: string) => {
        setSelectedQuiz(quizId);
        setShowModeModal(true);
    };

    const handleStartQuiz = () => {
        if (selectedQuiz && selectedMode) {
            setShowModeModal(false);
            router.push(`/study/practice?quizId=${selectedQuiz}&mode=${selectedMode}`);
        }
    };

    const handleDelete = async () => {
        if (selectedQuiz) {
            await deleteQuiz.mutateAsync(selectedQuiz);
            setShowOptionsModal(false);
            refetch();
        }
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
                    Your Questions
                </Text>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pt-6">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center pt-[100px]">
                        <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                        <Text variant="body2" color="gray" className="mt-3">Loading your quizzes...</Text>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center pt-[100px]">
                        <AlertCircle size={48} className="text-red-500" />
                        <Text variant="body2" color="gray" className="mt-3">Failed to load quizzes</Text>
                        <Button variant="outlined" onClick={() => refetch()} className="mt-4">Retry</Button>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center pt-[100px]">
                        <FileText size={48} className="text-[#C1C1C1]" />
                        <Text variant="body2" color="gray" className="mt-3">No quizzes yet. Generate some questions!</Text>
                        <Link href="/study/generate">
                            <Button variant="secondary" className="mt-4">Generate Questions</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {quizzes.map((quiz) => {
                            const quizId = quiz.id || quiz._id || "";
                            if (!quizId) return null;
                            return (
                                <div
                                    key={quizId}
                                    onClick={() => handleQuizPress(quizId)}
                                    className="flex items-center p-4 rounded-xl border border-[#D9D9D9] bg-white cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#2A996B]/10 flex items-center justify-center mr-3">
                                        <FileText size={24} className="text-[#2A996B]" />
                                    </div>
                                    <div className="flex-1">
                                        <Text variant="body" fontWeight="600">{quiz.title}</Text>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center">
                                                <Text variant="caption" fontWeight="600" color="secondary">
                                                    {quiz.questions?.length || 0}
                                                </Text>
                                                <Text variant="caption" color="gray" className="ml-1">questions</Text>
                                            </div>
                                            {quiz.duration && (
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <Text variant="caption" color="gray">{quiz.duration} min</Text>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedQuiz(quizId);
                                            setShowOptionsModal(true);
                                        }}
                                        className="p-2 bg-transparent border-0 cursor-pointer"
                                    >
                                        <MoreVertical size={20} className="text-[#C1C1C1]" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Options Modal */}
            {showOptionsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowOptionsModal(false)}>
                    <div className="w-full bg-white rounded-t-3xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setShowOptionsModal(false)} className="p-1 bg-transparent border-0 cursor-pointer">
                                <ChevronLeft size={24} className="text-[#1F382E]" />
                            </button>
                            <Text variant="body" fontWeight="600">Options</Text>
                            <div className="w-6" />
                        </div>

                        <button className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer" onClick={() => {
                            setShowOptionsModal(false);
                            router.push(`/study/edit-questions?quizId=${selectedQuiz}`);
                        }}>
                            <Edit2 size={20} className="text-[#1F382E]" />
                            <Text variant="body2" className="ml-4">Edit Questions</Text>
                        </button>

                        <button className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer">
                            <Download size={20} className="text-[#1F382E]" />
                            <Text variant="body2" className="ml-4">Save as PDF</Text>
                        </button>

                        <button className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer">
                            <Share2 size={20} className="text-[#1F382E]" />
                            <Text variant="body2" className="ml-4">Copy/Share Link</Text>
                        </button>

                        <button className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer" onClick={handleDelete}>
                            <Trash2 size={20} className="text-red-500" />
                            <Text variant="body2" className="ml-4 text-red-500">Delete</Text>
                        </button>
                    </div>
                </div>
            )}

            {/* Mode Selection Modal */}
            {showModeModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <div className="w-full bg-white rounded-t-[40px] px-10 pt-[50px] pb-16" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center mb-10">
                            <button onClick={() => setShowModeModal(false)} className="p-1 bg-transparent border-0 cursor-pointer absolute left-6">
                                <ChevronLeft size={24} className="text-[#1F382E]" />
                            </button>
                            <Text variant="body" fontWeight="600">Choose Your Mode of Practice</Text>
                        </div>

                        <div className="flex flex-col gap-5 mb-8">
                            <button
                                className={`flex items-center py-3 px-3 rounded-xl border ${selectedMode === "practice" ? "border-[#2A996B] bg-[#2A996B]/10" : "border-[#D9D9D9] bg-white"
                                    }`}
                                onClick={() => setSelectedMode("practice")}
                            >
                                <div className={`w-4 h-4 rounded-full border mr-5 flex items-center justify-center ${selectedMode === "practice" ? "border-[#2A996B]" : "border-black"
                                    }`}>
                                    {selectedMode === "practice" && <div className="w-2.5 h-2.5 rounded-full bg-[#2A996B]" />}
                                </div>
                                <BookOpen size={24} className="text-[#1F382E] mr-3" />
                                <Text variant="body" fontWeight="500">Practice Mode</Text>
                            </button>

                            <button
                                className={`flex items-center py-3 px-3 rounded-xl border ${selectedMode === "quiz" ? "border-[#2A996B] bg-[#2A996B]/10" : "border-[#D9D9D9] bg-white"
                                    }`}
                                onClick={() => setSelectedMode("quiz")}
                            >
                                <div className={`w-4 h-4 rounded-full border mr-5 flex items-center justify-center ${selectedMode === "quiz" ? "border-[#2A996B]" : "border-black"
                                    }`}>
                                    {selectedMode === "quiz" && <div className="w-2.5 h-2.5 rounded-full bg-[#2A996B]" />}
                                </div>
                                <HelpCircle size={24} className="text-[#1F382E] mr-3" />
                                <Text variant="body" fontWeight="500">Quiz Mode</Text>
                            </button>
                        </div>

                        <Button variant="secondary" fullWidth onClick={handleStartQuiz} disabled={!selectedMode}>
                            Continue
                        </Button>
                    </div>
                </div>
            )}
        </Container>
    );
}
