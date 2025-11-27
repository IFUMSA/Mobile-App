import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@services/api';

/**
 * Generic hook for GET requests with caching
 * @param {string} key - Unique query key for caching
 * @param {string} endpoint - API endpoint
 * @param {object} options - Additional react-query options
 */
export const useApiQuery = (key, endpoint, options = {}) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.data;
    },
    ...options,
  });
};

/**
 * Generic hook for POST/PUT/DELETE mutations
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (post, put, patch, delete)
 * @param {object} options - Additional options including invalidateKeys
 */
export const useApiMutation = (endpoint, method = 'post', options = {}) => {
  const queryClient = useQueryClient();
  const { invalidateKeys = [], ...mutationOptions } = options;

  return useMutation({
    mutationFn: async (data) => {
      const response = await api[method](endpoint, data);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries after mutation
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
      options.onSuccess?.(data, variables, context);
    },
    ...mutationOptions,
  });
};

/**
 * Hook to manually invalidate queries
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return (keys) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    keyArray.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
    });
  };
};
