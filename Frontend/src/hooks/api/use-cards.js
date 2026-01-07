import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cardService from '../../services/card';

// Query keys
export const cardKeys = {
  all: ['cards'],
  list: () => [...cardKeys.all, 'list'],
};

// Get user's saved cards
export const useCards = () => {
  return useQuery({
    queryKey: cardKeys.list(),
    queryFn: cardService.getCards,
  });
};

// Add card mutation
export const useSaveCardMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.addCard,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Set default card mutation
export const useSetDefaultCardMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.setDefaultCard,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

// Delete card mutation
export const useDeleteCardMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.deleteCard,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};
