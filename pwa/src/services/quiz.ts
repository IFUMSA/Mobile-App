import api from "@/lib/api";

// Quiz Service - matches mobile app services/quiz.js

export interface Quiz {
    id: string;
    title: string;
    description?: string;
    category?: string;
    questionCount: number;
    duration: number;
    questions?: Question[];
}

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

export interface QuizResult {
    score: number;
    total: number;
    percentage: number;
    corrections: { questionId: string; userAnswer: number; correctAnswer: number }[];
}

export const quizService = {
    // Get all quizzes
    getQuizzes: async (category?: string): Promise<{ quizzes: Quiz[] }> => {
        const params = category ? { category } : {};
        const response = await api.get("/api/quiz", { params });
        return response.data;
    },

    // Get quiz categories
    getCategories: async (): Promise<{ categories: string[] }> => {
        const response = await api.get("/api/quiz/categories");
        return response.data;
    },

    // Get quiz by ID
    getQuizById: async (id: string): Promise<{ quiz: Quiz }> => {
        const response = await api.get(`/api/quiz/${id}`);
        return response.data;
    },

    // Join quiz by code
    joinByCode: async (code: string): Promise<{ quiz: Quiz }> => {
        const response = await api.post("/api/quiz/join", { code });
        return response.data;
    },

    // Submit quiz answers
    submitQuiz: async (
        quizId: string,
        answers: Record<string, number>,
        timeSpent: number
    ): Promise<{ result: QuizResult }> => {
        const response = await api.post("/api/quiz/submit", {
            quizId,
            answers,
            timeSpent,
        });
        return response.data;
    },

    // Get user's quiz history
    getQuizHistory: async () => {
        const response = await api.get("/api/quiz/history");
        return response.data;
    },
};
