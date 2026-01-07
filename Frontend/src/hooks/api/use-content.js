import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import * as contentService from '../../services/content';

/**
 * Hook to fetch announcements for home carousel
 */
export const useAnnouncements = ({ page = 1, limit = 10 } = {}, options = {}) => {
  return useQuery({
    queryKey: ['announcements', { page, limit }],
    queryFn: () => contentService.getAnnouncements({ page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch upcoming events with pagination
 */
export const useEvents = ({ page = 1, limit = 10 } = {}, options = {}) => {
  return useQuery({
    queryKey: ['events', { page, limit }],
    queryFn: () => contentService.getEvents({ page, limit }),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for infinite scrolling events
 */
export const useInfiniteEvents = (limit = 10, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite'],
    queryFn: ({ pageParam = 1 }) => contentService.getEvents({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (pagination.page < pagination.pages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch the next upcoming event
 */
export const useNextEvent = (options = {}) => {
  return useQuery({
    queryKey: ['nextEvent'],
    queryFn: contentService.getNextEvent,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
