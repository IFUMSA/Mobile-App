import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as quizService from '../../services/quiz';

// Query keys
export const quizKeys = {
  all: ['quizzes'],
  lists: () => [...quizKeys.all, 'list'],
  list: (category) => [...quizKeys.lists(), { category }],
  details: () => [...quizKeys.all, 'detail'],
  detail: (id) => [...quizKeys.details(), id],
  categories: () => [...quizKeys.all, 'categories'],
  history: () => [...quizKeys.all, 'history'],
};

// Get all quizzes
export const useQuizzes = (category) => {
  return useQuery({
    queryKey: quizKeys.list(category),
    queryFn: () => quizService.getQuizzes(category),
  });
};

// Get quiz categories
export const useQuizCategories = () => {
  return useQuery({
    queryKey: quizKeys.categories(),
    queryFn: quizService.getCategories,
  });
};

// Get quiz by ID
export const useQuiz = (id) => {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => quizService.getQuizById(id),
    enabled: !!id,
  });
};

// Get quiz history
export const useQuizHistory = () => {
  return useQuery({
    queryKey: quizKeys.history(),
    queryFn: quizService.getQuizHistory,
  });
};

// Submit quiz mutation
export const useSubmitQuizMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizService.submitQuiz,
    onSuccess: (data) => {
      // Invalidate history to refetch
      queryClient.invalidateQueries({ queryKey: quizKeys.history() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};
