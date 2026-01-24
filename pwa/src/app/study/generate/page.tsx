"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ChevronLeft, Upload, X, Loader2 } from "lucide-react";
import api from "@/lib/api";

const questionTypes = [
    { value: "mcq", label: "Multiple Choice Questions (MCQs)" },
    { value: "truefalse", label: "True/False" },
];

const durations = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "60 minutes" },
];

export default function GenerateQuestionsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [topic, setTopic] = useState("");
    const [questionType, setQuestionType] = useState("mcq");
    const [numberOfQuestions, setNumberOfQuestions] = useState("10");
    const [duration, setDuration] = useState("30");
    const [uploadedFile, setUploadedFile] = useState<{ name: string; dataUrl: string; mimeType: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim() && !uploadedFile) {
            setError("Please enter a topic or upload study materials");
            return;
        }

        const numQuestions = parseInt(numberOfQuestions, 10);
        if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 50) {
            setError("Please enter a number between 1 and 50 for questions");
            return;
        }

        setIsGenerating(true);
        setLoadingMessage("Preparing your quiz...");
        setError(null);

        try {
            const fileParts = [];
            if (uploadedFile?.dataUrl) {
                fileParts.push({
                    type: "file",
                    mediaType: uploadedFile.mimeType,
                    url: uploadedFile.dataUrl,
                });
                setLoadingMessage("Processing uploaded materials...");
            }

            setLoadingMessage("AI is generating questions...");

            const response = await api.post("/api/ai/generate-questions", {
                topic: topic.trim(),
                questionType,
                numberOfQuestions: numQuestions,
                fileParts: fileParts.length > 0 ? fileParts : null,
            });

            const data = response.data;

            if (!data.success || !data.questions || data.questions.length === 0) {
                throw new Error("No questions were generated. Please try a different topic.");
            }

            setLoadingMessage("Questions ready! Opening preview...");

            // Navigate to preview screen with generated questions
            const params = new URLSearchParams({
                questions: JSON.stringify(data.questions),
                topic: topic.trim(),
                questionType,
                duration,
            });
            router.push(`/study/preview-questions?${params.toString()}`);
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || "Something went wrong. Please try again.");
        } finally {
            setIsGenerating(false);
            setLoadingMessage("");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE_MB = 5;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`Maximum file size is ${MAX_FILE_SIZE_MB}MB`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setUploadedFile({
                name: file.name,
                dataUrl: reader.result as string,
                mimeType: file.type,
            });
        };
        reader.readAsDataURL(file);
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
                    Generate Questions
                </Text>
            </div>

            {/* Form */}
            <div className="flex-1 px-6 pt-6 overflow-y-auto">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <Text variant="body2" className="text-red-600">{error}</Text>
                    </div>
                )}

                <div className="mb-5">
                    <Text variant="body2" fontWeight="500" className="mb-2">Quiz Name (Topic)</Text>
                    <TextInput
                        placeholder="e.g., Immunity, Cardiovascular System"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>

                <div className="mb-5">
                    <Text variant="body2" fontWeight="500" className="mb-2">Question Type</Text>
                    <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                        className="w-full p-3 border border-[#1F382E]/50 rounded-2xl focus:border-[#1F382E] focus:outline-none bg-white"
                    >
                        {questionTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-5">
                    <Text variant="body2" fontWeight="500" className="mb-2">Number of Questions (max 50)</Text>
                    <TextInput
                        placeholder="10"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(e.target.value)}
                        type="number"
                    />
                </div>

                <div className="mb-5">
                    <Text variant="body2" fontWeight="500" className="mb-2">Quiz Duration</Text>
                    <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-3 border border-[#1F382E]/50 rounded-2xl focus:border-[#1F382E] focus:outline-none bg-white"
                    >
                        {durations.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-5">
                    <Text variant="body2" fontWeight="500" className="mb-2">Upload Materials</Text>
                    {uploadedFile ? (
                        <div className="flex items-center justify-between p-3 border border-[#2A996B] border-dashed rounded-xl bg-white">
                            <Text variant="body2" className="flex-1 truncate">{uploadedFile.name}</Text>
                            <button onClick={() => setUploadedFile(null)} className="p-1 bg-transparent border-0 cursor-pointer">
                                <X size={20} className="text-red-500" />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center py-6 px-16 border border-black/50 border-dashed rounded-xl bg-white cursor-pointer hover:bg-gray-50"
                        >
                            <Upload size={48} className="text-[#9E9E9E] mb-1" />
                            <Text className="text-[14px] font-light">Upload Materials</Text>
                            <Text className="text-[14px] font-light">(PDFs, docs, images)</Text>
                            <div className="mt-2 px-4 py-1 rounded-lg bg-[#2A996B]/80">
                                <Text className="text-[12px] text-white">Upload</Text>
                            </div>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pt-6 pb-10">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleGenerate}
                    disabled={(!topic.trim() && !uploadedFile) || isGenerating}
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2">
                            <Loader2 size={20} className="animate-spin" />
                            {loadingMessage || "Generating..."}
                        </span>
                    ) : (
                        "Generate Questions"
                    )}
                </Button>
            </div>
        </Container>
    );
}
