"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useJoinQuizByCodeMutation } from "@/hooks/use-quiz";

function JoinQuizContent() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const joinQuiz = useJoinQuizByCodeMutation();
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!code.trim()) {
            setError("Please enter a quiz code");
            return;
        }
        try {
            const result = await joinQuiz.mutateAsync(code.trim());
            if (result.quiz) {
                router.push(`/quiz/${result.quiz.id}`);
            }
        } catch (e: unknown) {
            const err = e as { message?: string };
            setError(err.message || "Invalid code. Please try again.");
        }
    };

    return (
        <Container className="min-h-screen flex flex-col">
            <PageHeader title="Join Quiz" />

            <div className="flex-1">
                <Text variant="body" color="gray" className="mb-6">
                    Enter the quiz code shared with you to join a quiz.
                </Text>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <Text variant="body2" className="text-red-600">{error}</Text>
                    </div>
                )}

                <TextInput
                    placeholder="Enter quiz code"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError(null);
                    }}
                    label="Quiz Code"
                />
            </div>

            <div className="pb-8">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleJoin}
                    loading={joinQuiz.isPending}
                    disabled={!code.trim()}
                >
                    Join Quiz
                </Button>
            </div>
        </Container>
    );
}

export default function JoinQuizPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <JoinQuizContent />
        </Suspense>
    );
}
