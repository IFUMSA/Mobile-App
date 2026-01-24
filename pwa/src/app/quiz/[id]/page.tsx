"use client";

import React, { Suspense, use } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useQuiz } from "@/hooks/use-quiz";
import { PageHeader } from "@/components/ui/page-header";
import { Clock, HelpCircle, Loader2 } from "lucide-react";

function QuizDetailContent({ id }: { id: string }) {
    const router = useRouter();

    const { data: quizData, isLoading } = useQuiz(id);
    const quiz = quizData?.quiz;

    const handleStartQuiz = () => {
        router.push(`/quiz/${id}/take`);
    };

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Quiz Details" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    if (!quiz) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Quiz Details" />
                <div className="flex-1 flex items-center justify-center">
                    <Text variant="body" color="gray">Quiz not found</Text>
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen flex flex-col">
            <PageHeader title="Quiz Details" />

            <div className="flex-1">
                <Text variant="heading2" fontWeight="600" className="mb-4">
                    {quiz.title}
                </Text>

                {quiz.description && (
                    <Text variant="body" color="gray" className="mb-6">
                        {quiz.description}
                    </Text>
                )}

                <div className="flex gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <HelpCircle size={20} className="text-[#2A996B]" />
                        <Text variant="body2">{quiz.questionCount} questions</Text>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-[#2A996B]" />
                        <Text variant="body2">{quiz.duration} minutes</Text>
                    </div>
                </div>

                <div className="bg-[#2A996B]/10 rounded-xl p-4 mb-8">
                    <Text variant="body" fontWeight="600" className="mb-2">Instructions</Text>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><Text variant="body2" color="gray">Read each question carefully</Text></li>
                        <li><Text variant="body2" color="gray">Select the best answer from the options</Text></li>
                        <li><Text variant="body2" color="gray">You can navigate between questions</Text></li>
                        <li><Text variant="body2" color="gray">Submit when you&apos;re done</Text></li>
                    </ul>
                </div>
            </div>

            <div className="pb-8">
                <Button variant="secondary" fullWidth onClick={handleStartQuiz}>
                    Start Quiz
                </Button>
            </div>
        </Container>
    );
}

export default function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <QuizDetailContent id={id} />
        </Suspense>
    );
}
