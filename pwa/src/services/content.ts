import api from "@/lib/api";

// Content service - matches mobile app services/content.js

export const contentService = {
    // Get all announcements
    getAnnouncements: async () => {
        const response = await api.get("/api/content/announcements");
        return response.data;
    },

    // Get next event
    getNextEvent: async () => {
        const response = await api.get("/api/content/next-event");
        return response.data;
    },

    // Get all events
    getEvents: async () => {
        const response = await api.get("/api/events");
        return response.data;
    },

    // Get single event
    getEvent: async (id: string) => {
        const response = await api.get(`/api/events/${id}`);
        return response.data;
    },
};
