import React from "react";
import { cn } from "@/lib/utils";

type TextVariant =
    | "heading"
    | "heading2"
    | "heading3"
    | "subheading"
    | "body"
    | "body2"
    | "caption"
    | "button";

type TextColor =
    | "primary"
    | "secondary"
    | "textPrimary"
    | "textSecondary"
    | "white"
    | "gray"
    | "error"
    | "success";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
    variant?: TextVariant;
    color?: TextColor;
    align?: "left" | "center" | "right";
    fontWeight?: "400" | "500" | "600" | "700";
    as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label";
    noWrap?: boolean;
    uppercase?: boolean;
    children?: React.ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
    heading: "text-[32px] font-semibold leading-[40px] font-heading",
    heading2: "text-[24px] font-normal leading-[36px] font-heading",
    heading3: "text-[24px] font-semibold leading-[40px] font-body",
    subheading: "text-[18px] font-semibold font-heading",
    body: "text-[16px] font-normal leading-[24px] font-body",
    body2: "text-[14px] font-normal leading-[20px] font-body",
    caption: "text-[12px] font-normal leading-[20px] font-body",
    button: "text-[14px] font-semibold leading-[20px] font-body",
};

const colorStyles: Record<TextColor, string> = {
    primary: "text-[#1F382E]",
    secondary: "text-[#2A996B]",
    textPrimary: "text-white",
    textSecondary: "text-[#1F382E]",
    white: "text-white",
    gray: "text-[#C1C1C1]",
    error: "text-[#F84F4F]",
    success: "text-[#2A996B]",
};

const fontWeightStyles: Record<string, string> = {
    "400": "font-normal",
    "500": "font-medium",
    "600": "font-semibold",
    "700": "font-bold",
};

export function Text({
    variant = "body",
    color,
    align = "left",
    fontWeight,
    as,
    noWrap = false,
    uppercase = false,
    className,
    children,
    ...props
}: TextProps) {
    // Determine the HTML element to use
    const getElement = () => {
        if (as) return as;
        if (variant === "heading") return "h1";
        if (variant === "heading2") return "h2";
        if (variant === "heading3") return "h3";
        if (variant === "subheading") return "h4";
        return "p";
    };

    const Component = getElement();

    return (
        <Component
            className={cn(
                variantStyles[variant],
                color && colorStyles[color],
                fontWeight && fontWeightStyles[fontWeight],
                align === "center" && "text-center",
                align === "right" && "text-right",
                noWrap && "whitespace-nowrap overflow-hidden",
                uppercase && "uppercase",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}
