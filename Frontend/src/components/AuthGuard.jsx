import React, { useContext, useEffect, useState } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { AuthContext } from '@context/auth-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const PUBLIC_ROUTES = ['(auth)', 'index', '(onboarding)'];

export const AuthGuard = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useContext(AuthContext);
    const [isMounted, setIsMounted] = useState(false);

    // Safely try to get navigation state
    let segments = [];
    let router = null;
    let navigationReady = false;

    try {
        segments = useSegments();
        router = useRouter();
        const navigationState = useRootNavigationState();
        navigationReady = !!navigationState?.key;
    } catch (e) {
        // Navigation not available yet
        navigationReady = false;
    }

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !navigationReady || isLoading || !router) return;

        const currentRoute = segments[0] || 'index';
        const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute);

        if (!isAuthenticated && !isPublicRoute) {
            // Not authenticated and trying to access protected route
            router.replace('/');
        } else if (isAuthenticated && currentRoute === 'index') {
            // Authenticated but on login page
            if (user?.hasCompletedOnboarding) {
                router.replace('/home');
            } else {
                router.replace('/(onboarding)/profile');
            }
        }
    }, [isAuthenticated, isLoading, segments, navigationReady, user, isMounted]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2a996b" />
            </View>
        );
    }

    return children;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
});
