import React from 'react';
import { View, StyleSheet, Pressable, Image, Platform, ActivityIndicator } from 'react-native';
import { Text } from '@components/ui/Text';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useRouter } from 'expo-router';
import { useProductCategories } from '@hooks/api/use-products';
import Feather from '@expo/vector-icons/Feather';

// Map category values to display names and icons
const categoryConfig = {
    Clinical: {
        title: 'Clinical Essentials',
        icon: require('@assets/icons/Shop.png'),
    },
    Merch: {
        title: 'Merchandise',
        icon: require('@assets/icons/Shop.png'),
    },
    Synopsis: {
        title: 'Synopses',
        icon: require('@assets/icons/Exam.png'),
    },
};

// Default config for unknown categories
const defaultCategoryConfig = {
    icon: require('@assets/icons/Shop.png'),
};

const MarketplaceScreen = () => {
    const { theme } = useTheme();
    const router = useRouter();

    // Fetch categories from backend
    const { data: categoriesData, isLoading } = useProductCategories();
    const categories = categoriesData?.categories || [];

    const handleCategoryPress = (category) => {
        router.push(`/marketplace/${category}`);
    };

    const getCategoryDisplay = (category) => {
        const config = categoryConfig[category] || defaultCategoryConfig;
        return {
            title: config.title || category,
            icon: config.icon,
        };
    };

    if (isLoading) {
        return (
            <Container>
                <PageHeader title="Marketplace" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.secondary} />
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader title="Marketplace" />

            {categories.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="shopping-bag" size={48} color={theme.colors.gray} />
                    <Text variant="body" color="gray" style={styles.emptyText}>
                        No products available yet
                    </Text>
                </View>
            ) : (
                <View style={styles.categoriesContainer}>
                    {categories.map((category) => {
                        const display = getCategoryDisplay(category);
                        return (
                            <Pressable
                                key={category}
                                style={[
                                    styles.categoryCard,
                                    { backgroundColor: theme.colors.white },
                                ]}
                                onPress={() => handleCategoryPress(category)}
                            >
                                <View style={[styles.imageContainer, { backgroundColor: theme.colors.grayLight }]}>
                                    <Image
                                        source={display.icon}
                                        style={styles.categoryImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text variant="body" fontWeight="600" align="center" style={styles.categoryTitle}>
                                    {display.title}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </Container>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        paddingVertical: 24,
    },
    categoryCard: {
        width: '48%',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryImage: {
        width: 60,
        height: 60,
    },
    categoryTitle: {
        marginTop: 8,
    },
});

export default MarketplaceScreen;
