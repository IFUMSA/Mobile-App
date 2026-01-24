"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Text } from "./text";
import { MapPin, Clock, Calendar } from "lucide-react";
import Image from "next/image";

interface EventCardProps {
    title?: string;
    location?: string;
    time?: string;
    date?: string;
    image?: string;
    className?: string;
}

export function EventCard({
    title = "Chess Competition",
    location = "Event Location",
    time = "10:30am",
    date = "23/02/25",
    image,
    className,
}: EventCardProps) {
    return (
        <div className={cn("w-full", className)}>
            {/* Event Image */}
            <div className="relative w-full aspect-[1.943] min-h-[176px] rounded-2xl overflow-hidden mt-1 bg-[#D9D9D9]/20">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Text variant="caption" color="textSecondary">
                            Image
                        </Text>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mt-2 flex items-center justify-between">
                {/* Left side: Title and Location */}
                <div>
                    <Text variant="body" color="secondary" className="line-clamp-2">
                        {title}
                    </Text>
                    <div className="flex items-center gap-1 mt-1">
                        <MapPin size={20} className="text-[#C1C1C1]/50" />
                        <Text variant="caption" color="textSecondary">
                            {location}
                        </Text>
                    </div>
                </div>

                {/* Right side: Time and Date */}
                <div>
                    <div className="flex items-center gap-1">
                        <Clock size={20} className="text-[#C1C1C1]/50" />
                        <Text variant="caption">{time}</Text>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <Calendar size={20} className="text-[#C1C1C1]/50" />
                        <Text variant="caption">{date}</Text>
                    </div>
                </div>
            </div>
        </div>
    );
}
