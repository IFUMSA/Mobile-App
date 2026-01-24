"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/services/quiz";

// Query keys
export const quizKeys = {
    all: ["quizzes"] as const,
    lists: () => [...quizKeys.all, "list"] as const,
    list: (category?: string) => [...quizKeys.lists(), { category }] as const,
    details: () => [...quizKeys.all, "detail"] as const,
    detail: (id: string) => [...quizKeys.details(), id] as const,
    categories: () => [...quizKeys.all, "categories"] as const,
    history: () => [...quizKeys.all, "history"] as const,
};

// Get all quizzes
export function useQuizzes(category?: string) {
    return useQuery({
        queryKey: quizKeys.list(category),
        queryFn: () => quizService.getQuizzes(category),
    });
}

// Get quiz categories
export function useQuizCategories() {
    return useQuery({
        queryKey: quizKeys.categories(),
        queryFn: quizService.getCategories,
    });
}

// Get quiz by ID
export function useQuiz(id: string) {
    return useQuery({
        queryKey: quizKeys.detail(id),
        queryFn: () => quizService.getQuizById(id),
        enabled: !!id,
    });
}

// Get quiz history
export function useQuizHistory() {
    return useQuery({
        queryKey: quizKeys.history(),
        queryFn: quizService.getQuizHistory,
    });
}

// Submit quiz mutation
export function useSubmitQuizMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            quizId,
            answers,
            timeSpent,
        }: {
            quizId: string;
            answers: Record<string, number>;
            timeSpent: number;
        }) => quizService.submitQuiz(quizId, answers, timeSpent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: quizKeys.history() });
        },
    });
}

// Join quiz by code mutation
export function useJoinQuizByCodeMutation() {
    return useMutation({
        mutationFn: (code: string) => quizService.joinByCode(code),
    });
}
