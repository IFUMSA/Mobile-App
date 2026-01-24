"use client";

import React, { useState, useMemo } from "react";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { EventCard } from "@/components/ui/event-card";
import { Sidebar } from "@/components/ui/sidebar";
import { NavigationLinks } from "./navigation-links";
import { AnnouncementCarousel } from "./announcement-carousel";
import { useNextEvent } from "@/hooks/use-content";
import { Menu } from "lucide-react";

export function Home() {
    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Fetch next event from API
    const { data: eventData } = useNextEvent();

    const openSidebar = () => {
        setSidebarVisible(true);
    };

    const closeSidebar = () => {
        setSidebarVisible(false);
    };

    // Format event data for EventCard
    const nextEvent = useMemo(() => {
        if (!eventData?.event) return null;
        const event = eventData.event;
        const startDate = new Date(event.startDate);
        return {
            title: event.title,
            location: event.location || "TBA",
            time: startDate.toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            date: startDate.toLocaleDateString("en-NG", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
            }),
            image: event.image,
        };
    }, [eventData]);

    return (
        <div className="flex-1 min-h-screen bg-white">
            {/* Header - Matches mobile: primary bg, rounded bottom corners */}
            <div className="bg-[#1F382E] px-6 pt-[72px] pb-[60px] min-h-[197px] rounded-b-[48px]">
                <button
                    className="w-11 h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer"
                    onClick={openSidebar}
                >
                    <Menu size={24} color="white" />
                </button>
            </div>

            {/* Content - Carousel pulls up with -mt-[50px] like mobile's marginTop: -50 */}
            <Container className="relative z-10">
                <AnnouncementCarousel />

                <Text variant="heading2" fontWeight="600" className="mt-9">
                    Next Event
                </Text>

                {nextEvent ? (
                    <EventCard
                        title={nextEvent.title}
                        location={nextEvent.location}
                        time={nextEvent.time}
                        date={nextEvent.date}
                        image={nextEvent.image}
                    />
                ) : (
                    <EventCard />
                )}

                <NavigationLinks />
            </Container>

            <Sidebar visible={sidebarVisible} onClose={closeSidebar} />
        </div>
    );
}
