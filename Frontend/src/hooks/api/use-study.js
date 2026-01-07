import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as studyService from '../../services/study';

// Query keys
export const studyKeys = {
  all: ['study'],
  quizzes: () => [...studyKeys.all, 'quizzes'],
  quiz: (id) => [...studyKeys.all, 'quiz', id],
};

// Get user's quizzes
export const useUserQuizzes = () => {
  return useQuery({
    queryKey: studyKeys.quizzes(),
    queryFn: studyService.getUserQuizzes,
  });
};

// Get quiz by ID
export const useUserQuiz = (id) => {
  return useQuery({
    queryKey: studyKeys.quiz(id),
    queryFn: () => studyService.getUserQuizById(id),
    enabled: !!id,
  });
};

// Save generated quiz mutation
export const useSaveQuizMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studyService.saveGeneratedQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyKeys.quizzes() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Update quiz mutation
export const useUpdateQuizMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studyService.updateUserQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyKeys.quizzes() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Delete quiz mutation
export const useDeleteQuizMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: studyService.deleteUserQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyKeys.quizzes() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};
