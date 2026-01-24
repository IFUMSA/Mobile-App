"use client";

import { useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content";

export function useAnnouncements() {
    return useQuery({
        queryKey: ["announcements"],
        queryFn: contentService.getAnnouncements,
    });
}

export function useNextEvent() {
    return useQuery({
        queryKey: ["nextEvent"],
        queryFn: contentService.getNextEvent,
    });
}

export function useEvents() {
    return useQuery({
        queryKey: ["events"],
        queryFn: contentService.getEvents,
    });
}
