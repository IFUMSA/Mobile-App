import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
    return (
        <div
            className={cn(
                "w-full px-6 py-10 bg-white",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
