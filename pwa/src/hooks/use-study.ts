"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyService, type GeneratedQuestion } from "@/services/study";

// Query keys
export const studyKeys = {
    all: ["study"] as const,
    quizzes: () => [...studyKeys.all, "quizzes"] as const,
    quiz: (id: string) => [...studyKeys.all, "quiz", id] as const,
};

// Get user's quizzes
export function useUserQuizzes() {
    return useQuery({
        queryKey: studyKeys.quizzes(),
        queryFn: studyService.getUserQuizzes,
    });
}

// Get quiz by ID
export function useUserQuiz(id: string) {
    return useQuery({
        queryKey: studyKeys.quiz(id),
        queryFn: () => studyService.getUserQuizById(id),
        enabled: !!id,
    });
}

// Generate questions mutation
export function useGenerateQuestionsMutation() {
    return useMutation({
        mutationFn: ({
            content,
            questionType,
            count,
        }: {
            content: string;
            questionType: string;
            count: number;
        }) => studyService.generateQuestions(content, questionType, count),
    });
}

// Save generated quiz mutation
export function useSaveQuizMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            title: string;
            questions: GeneratedQuestion[];
            questionType: string;
            duration: number;
        }) => studyService.saveGeneratedQuiz(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: studyKeys.quizzes() });
        },
    });
}

// Update quiz mutation
export function useUpdateQuizMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: { title?: string; questions?: GeneratedQuestion[] };
        }) => studyService.updateUserQuiz(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: studyKeys.quizzes() });
        },
    });
}

// Delete quiz mutation
export function useDeleteQuizMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => studyService.deleteUserQuiz(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: studyKeys.quizzes() });
        },
    });
}
