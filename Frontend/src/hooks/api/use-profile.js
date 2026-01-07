import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userService from '../../services/user';

// Query keys
export const profileKeys = {
  all: ['profile'],
  current: () => [...profileKeys.all, 'current'],
  user: (id) => [...profileKeys.all, 'user', id],
};

// Get current user profile
export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: userService.getProfile,
  });
};

// Get user by ID
export const useUser = (userId) => {
  return useQuery({
    queryKey: profileKeys.user(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });
};

// Update profile mutation
export const useUpdateProfileMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      // Update the cached profile data
      queryClient.setQueryData(profileKeys.current(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};
