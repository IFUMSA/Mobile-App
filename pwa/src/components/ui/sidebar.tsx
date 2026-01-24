"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Text } from "./text";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { User, ShoppingCart, CreditCard, LogOut } from "lucide-react";
import Image from "next/image";

const SIDEBAR_WIDTH = "50%";

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    route: string;
}

const navigationItems: NavItem[] = [
    {
        id: "profile",
        label: "Profile",
        icon: <User size={20} />,
        route: "/profile",
    },
    {
        id: "cart",
        label: "Cart",
        icon: <ShoppingCart size={20} />,
        route: "/cart",
    },
    {
        id: "payment-status",
        label: "Payment Status",
        icon: <CreditCard size={20} />,
        route: "/payment/status",
    },
];

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
}

export function Sidebar({ visible, onClose }: SidebarProps) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            // Trigger animation after mount
            requestAnimationFrame(() => {
                setIsAnimating(true);
            });
        } else {
            setIsAnimating(false);
            // Wait for animation to complete before unmounting
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleClose = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    const handleNavigation = useCallback((route: string) => {
        handleClose();
        setTimeout(() => {
            router.push(route);
        }, 350);
    }, [handleClose, router]);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            await logout();
            handleClose();
            setTimeout(() => {
                router.replace("/");
            }, 100);
        } catch (error) {
            console.error("Logout error:", error);
            setIsLoggingOut(false);
        }
    }, [handleClose, logout, router, isLoggingOut]);

    // Get user display name
    const displayName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
        : "Guest";

    if (!shouldRender) {
        return null;
    }

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 transition-opacity duration-300",
                isAnimating ? "bg-black/50" : "bg-transparent"
            )}
            onClick={handleClose}
        >
            <div
                ref={sidebarRef}
                className={cn(
                    "absolute left-0 top-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-out",
                    "pt-[53px] px-4",
                    isAnimating ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ width: SIDEBAR_WIDTH, minWidth: "200px", maxWidth: "280px" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-9">
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-1 bg-[#D9D9D9]">
                        {user?.profilePic ? (
                            <Image
                                src={user.profilePic}
                                alt="Profile"
                                width={64}
                                height={64}
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User size={32} className="text-[#1F382E]" />
                            </div>
                        )}
                    </div>
                    <Text variant="caption" className="capitalize">
                        {displayName}
                    </Text>
                </div>

                {/* Navigation */}
                <div className="flex-1">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            className="flex items-center w-full mb-3 p-0 bg-transparent border-0 cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={() => handleNavigation(item.route)}
                        >
                            <div className="mr-3 w-6 h-6 flex items-center justify-center text-[#1F382E]">
                                {item.icon}
                            </div>
                            <Text variant="caption">{item.label}</Text>
                        </button>
                    ))}
                </div>

                {/* Logout */}
                <button
                    className="flex items-center pb-10 p-0 bg-transparent border-0 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <div className="mr-3 w-6 h-6 flex items-center justify-center text-[#F84F4F]">
                        <LogOut size={20} />
                    </div>
                    <Text variant="caption" color="error">
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </Text>
                </button>
            </div>
        </div>
    );
}
