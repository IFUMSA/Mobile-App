import api from "@/lib/api";

// Study Service - matches mobile app services/study.js

export interface GeneratedQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface UserQuiz {
    id: string;
    _id?: string; // Fallback for backward compatibility
    title: string;
    questions: GeneratedQuestion[];
    questionType: "mcq" | "truefalse" | "short";
    duration: number;
    createdAt?: string;
}

export const studyService = {
    // Generate questions using AI
    generateQuestions: async (
        content: string,
        questionType: string,
        count: number
    ): Promise<{ questions: GeneratedQuestion[] }> => {
        const response = await api.post("/api/study/generate", {
            content,
            questionType,
            count,
        });
        return response.data;
    },

    // Save generated quiz
    saveGeneratedQuiz: async (data: {
        title: string;
        questions: GeneratedQuestion[];
        questionType: string;
        duration: number;
    }): Promise<{ quiz: UserQuiz }> => {
        const response = await api.post("/api/study/quizzes", data);
        return response.data;
    },

    // Get user's quizzes
    getUserQuizzes: async (): Promise<{ quizzes: UserQuiz[] }> => {
        const response = await api.get("/api/study/quizzes");
        return response.data;
    },

    // Get quiz by ID
    getUserQuizById: async (id: string): Promise<{ quiz: UserQuiz }> => {
        const response = await api.get(`/api/study/quizzes/${id}`);
        return response.data;
    },

    // Update quiz
    updateUserQuiz: async (
        id: string,
        data: { title?: string; questions?: GeneratedQuestion[] }
    ): Promise<{ quiz: UserQuiz }> => {
        const response = await api.put(`/api/study/quizzes/${id}`, data);
        return response.data;
    },

    // Delete quiz
    deleteUserQuiz: async (id: string) => {
        const response = await api.delete(`/api/study/quizzes/${id}`);
        return response.data;
    },
};
