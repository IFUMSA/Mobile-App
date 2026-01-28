"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth-context";

/**
 * Landing Screen - Animated splash screens before auth
 * 
 * Flow:
 * - Screen 0: IFUMSA Logo on green background (3 seconds) → fade →
 * - Screen 1: "Hello IFUMSAITE!" (3 seconds) → fade → 
 * - Screen 2: "Let's learn, grow and succeed together!" (3 seconds) → 
 * - Redirect to /signup
 * 
 * If user is authenticated: redirect to /home or /onboarding/profile
 */

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const totalScreens = 3;
  const finalScreenIndex = 2;

  // Check auth state and redirect accordingly
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      if (!user.hasCompletedOnboarding) {
        router.replace("/onboarding/profile");
      } else {
        router.replace("/home");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const animateToNextScreen = useCallback(() => {
    if (isAnimating) return;
    if (currentScreen === finalScreenIndex) {
      router.push("/signup");
      return;
    }

    setIsAnimating(true);

    // Fade out
    setOpacity(0);

    setTimeout(() => {
      setCurrentScreen((prev) => (prev + 1) % totalScreens);

      // Fade in
      setTimeout(() => {
        setOpacity(1);
        setIsAnimating(false);
      }, 50);
    }, 800);
  }, [currentScreen, isAnimating, router]);

  // Auto-transition timer
  useEffect(() => {
    if (isAnimating || isLoading) return;

    const timer = setTimeout(() => {
      if (currentScreen === finalScreenIndex) {
        router.push("/signup");
      } else {
        animateToNextScreen();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [animateToNextScreen, currentScreen, isAnimating, isLoading, router]);

  // If loading auth, show logo with pulse animation
  if (isLoading) {
    return (
      <div className="h-[100dvh] bg-[#1F382E] flex items-center justify-center">
        <div className="animate-pulse">
          <Image
            src="/images/ifumsa-logo.png"
            alt="IFUMSA"
            width={200}
            height={133}
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#1F382E] fixed inset-0">
      <div
        className="h-full transition-opacity duration-[800ms] ease-in-out"
        style={{ opacity }}
      >
        {/* Screen 0: IFUMSA Logo */}
        {currentScreen === 0 && (
          <div className="w-full h-full flex items-center justify-center px-6">
            <Image
              src="/images/ifumsa-logo.png"
              alt="IFUMSA Logo"
              width={300}
              height={200}
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Screen 1: Hello IFUMSAITE */}
        {currentScreen === 1 && (
          <div className="w-full h-full flex flex-col">
            <div className="relative w-full h-[65%]">
              <Image
                src="/images/onboarding1.png"
                alt="Hello IFUMSAITE"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 flex items-center justify-center px-6">
              <Text variant="heading" color="textPrimary" fontWeight="700">
                Hello IFUMSAITE!
              </Text>
            </div>
          </div>
        )}

        {/* Screen 2: Let's learn together */}
        {currentScreen === 2 && (
          <div className="w-full h-full flex flex-col">
            <div className="relative w-full h-[65%]">
              <Image
                src="/images/onboarding2.png"
                alt="Let's learn together"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 flex items-center justify-center px-6">
              <Text
                variant="heading"
                color="textPrimary"
                fontWeight="700"
                className="text-center"
              >
                Let&apos;s learn, grow and succeed together!
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
