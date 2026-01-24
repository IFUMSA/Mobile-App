"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Text } from "./text";

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    error?: string | boolean;
    helperText?: string;
    required?: boolean;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    innerLabel?: boolean;
    showSlash?: boolean;
    wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            label,
            error,
            helperText,
            required = false,
            disabled = false,
            startAdornment,
            endAdornment,
            innerLabel = false,
            showSlash = false,
            className,
            wrapperClassName,
            onFocus,
            onBlur,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            onBlur?.(e);
        };

        const getBorderColor = () => {
            if (error) return "border-[#F84F4F]";
            if (disabled) return "border-[#C1C1C1]/50";
            if (isFocused) return "border-[#1F382E]";
            return "border-[#1F382E]/50";
        };

        const getLabelColor = () => {
            if (error) return "error";
            if (disabled) return "gray";
            if (isFocused) return "primary";
            return "textSecondary";
        };

        return (
            <div className={cn("w-full", wrapperClassName)}>
                {/* External label */}
                {!innerLabel && label && (
                    <div className="flex items-center mb-2">
                        <Text variant="body2" color={getLabelColor() as "error" | "gray" | "primary" | "textSecondary"}>
                            {label}
                        </Text>
                        {required && (
                            <Text variant="body2" color="error" className="ml-1">
                                *
                            </Text>
                        )}
                    </div>
                )}

                {/* Input container */}
                <div className="relative w-full">
                    {/* Inner label */}
                    {innerLabel && label && (
                        <div
                            className={cn(
                                "absolute top-2 z-10 text-[#C1C1C1]/50",
                                startAdornment ? (showSlash ? "left-[88px]" : "left-10") : "left-4"
                            )}
                        >
                            <Text variant="body2" color="gray">
                                {label}
                                {required && "*"}
                            </Text>
                        </div>
                    )}

                    {/* Start adornment */}
                    {startAdornment && (
                        <div className="absolute top-0 left-4 h-full flex items-center justify-center z-10">
                            {startAdornment}
                        </div>
                    )}

                    {/* Slash divider */}
                    {showSlash && startAdornment && (
                        <div className="absolute left-16 top-[10px] h-11 w-px bg-black z-10" />
                    )}

                    {/* End adornment */}
                    {endAdornment && (
                        <div className="absolute top-0 right-4 h-full flex items-center justify-center z-10">
                            {endAdornment}
                        </div>
                    )}

                    {/* Input */}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full border rounded-2xl bg-white text-[#1F382E] transition-colors duration-200",
                            "placeholder:text-[#C1C1C1] focus:outline-none",
                            innerLabel ? "pt-8 pb-[10px] h-16" : "py-[14px] h-12",
                            startAdornment ? (showSlash ? "pl-[88px]" : "pl-10") : "pl-4",
                            endAdornment ? "pr-10" : "pr-4",
                            getBorderColor(),
                            disabled && "opacity-50 cursor-not-allowed",
                            className
                        )}
                        disabled={disabled}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    />
                </div>

                {/* Error message */}
                {error && typeof error === "string" && (
                    <Text variant="caption" color="error" className="mt-2">
                        {error}
                    </Text>
                )}

                {/* Helper text */}
                {helperText && !error && (
                    <Text variant="caption" color="gray" className="mt-2">
                        {helperText}
                    </Text>
                )}
            </div>
        );
    }
);

TextInput.displayName = "TextInput";
