import api from './api';

/**
 * Content Service - handles announcements, events, and public content
 */

// Get active announcements for home carousel
export const getAnnouncements = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get('/api/content/announcements', {
    params: { page, limit }
  });
  return response.data;
};

// Get active/upcoming events with pagination
export const getEvents = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get('/api/content/events', {
    params: { page, limit }
  });
  return response.data;
};

// Get the next upcoming event
export const getNextEvent = async () => {
  const response = await api.get('/api/content/events/next');
  return response.data;
};

export default {
  getAnnouncements,
  getEvents,
  getNextEvent,
};
