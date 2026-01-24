"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed as PWA
        const standalone = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        setIsStandalone(standalone);

        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Listen for beforeinstallprompt (Android/Desktop Chrome)
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after a short delay
            setTimeout(() => setShowPrompt(true), 2000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);

        // For iOS, show prompt after a delay if not installed
        if (iOS && !standalone) {
            const dismissed = localStorage.getItem("pwa-install-dismissed");
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("pwa-install-dismissed", "true");
    };

    // Don't show if already installed or dismissed
    if (!showPrompt || isStandalone) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-lg p-4 mx-auto max-w-md border border-gray-100">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1F382E] flex items-center justify-center flex-shrink-0">
                        <Image
                            src="/images/ifumsa-logo.png"
                            alt="IFUMSA"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex-1">
                        <Text variant="body" fontWeight="600">
                            Install IFUMSA App
                        </Text>
                        <Text variant="caption" color="gray" className="mt-1">
                            {isIOS
                                ? "Tap the Share button, then 'Add to Home Screen'"
                                : "Install for quick access and offline use"
                            }
                        </Text>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 bg-transparent border-0 cursor-pointer"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex gap-3 mt-4">
                    {isIOS ? (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#1F382E]/5 rounded-xl">
                            <Share size={18} className="text-[#2A996B]" />
                            <Text variant="body2" color="secondary">
                                Tap Share → Add to Home Screen
                            </Text>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                onClick={handleDismiss}
                                className="flex-1"
                            >
                                Not Now
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleInstall}
                                className="flex-1"
                            >
                                <Download size={18} className="mr-2" />
                                Install
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
