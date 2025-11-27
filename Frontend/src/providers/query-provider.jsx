import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
