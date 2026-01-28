"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useUserQuizzes, useDeleteQuizMutation } from "@/hooks/use-study";
import { studyService } from "@/services/study";
import { ChevronLeft, FileText, MoreVertical, Clock, Edit2, Download, Share2, Trash2, Copy, BookOpen, HelpCircle, Loader2, AlertCircle, Check } from "lucide-react";

interface Question {
    question: string;
    options?: string[];
    correctAnswer?: number | string;
}

interface Quiz {
    id?: string;
    _id?: string;
    title: string;
    questions?: Question[];
    questionCount?: number;
    duration?: number;
}

export default function MyQuestionsPage() {
    const router = useRouter();
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showModeModal, setShowModeModal] = useState(false);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

    const { data: quizzesData, isLoading, error, refetch } = useUserQuizzes();
    const deleteQuiz = useDeleteQuizMutation();
    const quizzes = (quizzesData?.quizzes || []) as Quiz[];

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

    // Get the currently selected quiz data (from list - no questions)
    const getSelectedQuizData = (): Quiz | null => {
        return quizzes.find(q => (q.id || q._id) === selectedQuiz) || null;
    };

    // Fetch full quiz data with questions
    const fetchFullQuiz = async (): Promise<Quiz | null> => {
        if (!selectedQuiz) return null;
        try {
            setIsLoadingQuiz(true);
            const { quiz } = await studyService.getUserQuizById(selectedQuiz);
            return {
                id: quiz.id || quiz._id,
                title: quiz.title,
                questions: quiz.questions,
                duration: quiz.duration,
            } as Quiz;
        } catch (error) {
            console.error("Failed to fetch quiz:", error);
            return null;
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    // Format questions as text for copying
    const formatQuestionsAsText = (quiz: Quiz): string => {
        if (!quiz.questions) return "";

        return `${quiz.title}\n${"=".repeat(quiz.title.length)}\n\n` +
            quiz.questions.map((q, i) => {
                let text = `${i + 1}. ${q.question}\n`;
                if (q.options) {
                    text += q.options.map((opt, j) =>
                        `   ${String.fromCharCode(65 + j)}. ${opt}`
                    ).join("\n");
                }
                return text;
            }).join("\n\n");
    };

    // Handle copy to clipboard
    const handleCopy = async () => {
        const quiz = await fetchFullQuiz();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            alert("No questions to copy");
            return;
        }

        const text = formatQuestionsAsText(quiz);

        // Try modern clipboard API first, fallback to textarea method
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for PWA/mobile
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            setIsCopied(true);
            setShowOptionsModal(false);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error("Copy failed:", error);
            alert("Failed to copy questions");
        }
    };

    // Handle share link
    const handleShare = async () => {
        const listQuiz = getSelectedQuizData();
        if (!listQuiz) {
            alert("No quiz selected");
            return;
        }

        // Share link points to quiz mode
        const shareUrl = `${window.location.origin}/study/practice?quizId=${selectedQuiz}&mode=quiz`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: listQuiz.title,
                    text: `Take this quiz: ${listQuiz.title}`,
                    url: shareUrl,
                });
            } else {
                // Fallback: copy to clipboard
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(shareUrl);
                } else {
                    const textarea = document.createElement("textarea");
                    textarea.value = shareUrl;
                    textarea.style.position = "fixed";
                    textarea.style.left = "-9999px";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                }
                alert("Quiz link copied to clipboard!");
            }
        } catch (error) {
            if ((error as Error).name !== "AbortError") {
                console.error("Share failed:", error);
                alert("Failed to share quiz");
            }
        }
        setShowOptionsModal(false);
    };

    // Handle save as PDF
    const handleSavePDF = async () => {
        const quiz = await fetchFullQuiz();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            alert("No questions to export");
            return;
        }

        setIsGeneratingPDF(true);
        setShowOptionsModal(false);

        try {
            // Create printable HTML content
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${quiz.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        h1 { color: #1F382E; border-bottom: 2px solid #2A996B; padding-bottom: 10px; }
                        .question { margin-bottom: 30px; }
                        .question-number { font-weight: bold; color: #2A996B; }
                        .question-text { font-size: 16px; margin-bottom: 10px; }
                        .options { margin-left: 20px; }
                        .option { padding: 5px 0; }
                        .option-letter { font-weight: bold; margin-right: 10px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <h1>${quiz.title}</h1>
                    ${quiz.questions.map((q, i) => `
                        <div class="question">
                            <div class="question-text">
                                <span class="question-number">Q${i + 1}.</span> ${q.question}
                            </div>
                            ${q.options ? `
                                <div class="options">
                                    ${q.options.map((opt, j) => `
                                        <div class="option">
                                            <span class="option-letter">${String.fromCharCode(65 + j)}.</span> ${opt}
                                        </div>
                                    `).join("")}
                                </div>
                            ` : ""}
                        </div>
                    `).join("")}
                </body>
                </html>
            `;

            // Use hidden iframe instead of popup
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "none";
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(printContent);
                iframeDoc.close();

                // Wait for content to load then print
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    // Remove iframe after printing
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 1000);
                }, 300);
            }
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Failed to generate PDF");
        } finally {
            setIsGeneratingPDF(false);
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
                                                    {quiz.questionCount ?? quiz.questions?.length ?? 0}
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
                )
                }
            </div >

            {/* Options Modal */}
            {
                showOptionsModal && (
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

                            <button
                                className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer"
                                onClick={handleSavePDF}
                                disabled={isGeneratingPDF}
                            >
                                <Download size={20} className="text-[#1F382E]" />
                                <Text variant="body2" className="ml-4">
                                    {isGeneratingPDF ? "Generating..." : "Save as PDF"}
                                </Text>
                            </button>

                            <button
                                className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer"
                                onClick={handleCopy}
                            >
                                {isCopied ? (
                                    <Check size={20} className="text-green-500" />
                                ) : (
                                    <Copy size={20} className="text-[#1F382E]" />
                                )}
                                <Text variant="body2" className="ml-4">
                                    {isCopied ? "Copied!" : "Copy Questions"}
                                </Text>
                            </button>

                            <button
                                className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer"
                                onClick={handleShare}
                            >
                                <Share2 size={20} className="text-[#1F382E]" />
                                <Text variant="body2" className="ml-4">Share Link</Text>
                            </button>

                            <button className="flex items-center w-full py-4 bg-transparent border-0 cursor-pointer" onClick={handleDelete}>
                                <Trash2 size={20} className="text-red-500" />
                                <Text variant="body2" className="ml-4 text-red-500">Delete</Text>
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Mode Selection Modal */}
            {
                showModeModal && (
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
                )
            }
        </Container >
    );
}
