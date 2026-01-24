"use client";

import React, { useMemo } from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { EventCard } from "@/components/ui/event-card";
import { useEvents } from "@/hooks/use-content";
import { Calendar, Loader2 } from "lucide-react";

interface Event {
    _id: string;
    title: string;
    startDate: string;
    location?: string;
    image?: string;
}

export default function EventsPage() {
    const { data: eventsData, isLoading } = useEvents();
    const events = (eventsData?.events || []) as Event[];

    // Format events for EventCard component (same as homepage)
    const formattedEvents = useMemo(() => {
        return events.map((event) => {
            const startDate = new Date(event.startDate);
            return {
                ...event,
                formattedTitle: event.title,
                formattedLocation: event.location || "TBA",
                formattedTime: startDate.toLocaleTimeString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                formattedDate: startDate.toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                }),
                formattedImage: event.image,
            };
        });
    }, [events]);

    if (isLoading) {
        return (
            <Container className="min-h-screen">
                <PageHeader title="Events" />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A996B]" />
                </div>
            </Container>
        );
    }

    return (
        <Container className="min-h-screen">
            <PageHeader title="Events" />

            {events.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-[60px]">
                    <Calendar size={48} className="text-[#C1C1C1]" />
                    <Text variant="body" color="gray" className="mt-3">
                        No upcoming events
                    </Text>
                </div>
            ) : (
                <div className="flex flex-col gap-6 py-4 pb-10">
                    {formattedEvents.map((event) => (
                        <EventCard
                            key={event._id}
                            title={event.formattedTitle}
                            location={event.formattedLocation}
                            time={event.formattedTime}
                            date={event.formattedDate}
                            image={event.formattedImage}
                        />
                    ))}
                </div>
            )}
        </Container>
    );
}
