"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outlined" | "text";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#2A996B] text-white border-transparent hover:bg-[#238a5f] active:scale-[0.98]",
    secondary: "bg-[#1F382E] text-white border-transparent hover:bg-[#162821] active:scale-[0.98]",
    outlined: "bg-transparent text-[#1F382E] border-[#2A996B] border hover:bg-[#2A996B]/10 active:scale-[0.98]",
    text: "bg-transparent text-[#1F382E] border-transparent hover:bg-[#1F382E]/5 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
    small: "py-2 px-4 rounded-lg text-[12px]",
    medium: "py-3 px-6 rounded-xl text-[14px]",
    large: "py-4 px-8 rounded-2xl text-[16px]",
};

const disabledStyles = "opacity-60 cursor-not-allowed pointer-events-none bg-[#A0A0A0] text-[#666666]";

export function Button({
    variant = "primary",
    size = "medium",
    loading = false,
    fullWidth = false,
    disabled = false,
    className,
    children,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center font-semibold font-body transition-all duration-200 border-0",
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && "w-full",
                isDisabled && disabledStyles,
                className
            )}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                children
            )}
        </button>
    );
}
