import { QueryClient } from '@tanstack/react-query';

// Create a client with sensible defaults for mobile
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus (mobile doesn't have this)
      refetchOnWindowFocus: false,
      // Refetch when network reconnects
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
