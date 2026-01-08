import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { Text } from '@components/ui/Text';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useProducts, useAddToCartMutation } from '@api';
import { useLocalSearchParams } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const categoryTitles = {
    Clinical: 'Clinical Essentials',
    Merch: 'Merchandise',
    Synopsis: 'Synopses',
};

const ProductListScreen = () => {
    const { theme } = useTheme();
    const { category } = useLocalSearchParams();
    const [addedItems, setAddedItems] = useState(new Set());

    const { data: productsData, isLoading } = useProducts(category);
    const { mutate: addToCart, isPending: isAdding } = useAddToCartMutation({
        onSuccess: (data, variables) => {
            console.log('Add to cart success:', data, variables);
            if (variables?.productId) {
                setAddedItems((prev) => new Set([...prev, variables.productId]));
            }
        },
        onError: (error) => {
            console.error('Add to cart error:', error);
        },
    });

    const products = productsData?.products || [];
    const title = categoryTitles[category] || category || 'Products';

    const handleAddToCart = (productId) => {
        console.log('Adding to cart:', productId);
        if (!addedItems.has(productId)) {
            addToCart({ productId, quantity: 1 });
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG').format(price);
    };

    const renderProductItem = ({ item }) => {
        const isAdded = addedItems.has(item._id);

        return (
            <View style={[styles.productCard, { borderColor: theme.colors.grayLight }]}>
                <View style={styles.productImage}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.productInfo}>
                    <Text variant="body" fontWeight="600" numberOfLines={2} style={styles.productTitle}>
                        {item.title}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Text variant="body2" color="textSecondary">
                            ₦{formatPrice(item.price)}
                        </Text>
                    </View>
                </View>
                <Pressable
                    style={[
                        styles.addButton,
                        { backgroundColor: isAdded ? theme.colors.gray : theme.colors.secondary },
                    ]}
                    onPress={() => handleAddToCart(item._id)}
                    disabled={isAdded || isAdding}
                >
                    <Text variant="caption" color="white" fontWeight="500">
                        {isAdded ? 'Added' : 'Add to cart'}
                    </Text>
                </Pressable>
            </View>
        );
    };

    if (isLoading) {
        return (
            <Container>
                <PageHeader title={title} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.secondary} />
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader title={title} />

            {products.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="package" size={48} color={theme.colors.gray} />
                    <Text variant="body" color="gray" style={styles.emptyText}>
                        No products available in this category
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.productList}
                />
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
    productList: {
        gap: 16,
        paddingBottom: 20,
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    productImage: {
        width: 78,
        height: 100,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        flex: 1,
        marginLeft: 16,
        marginRight: 12,
    },
    productTitle: {
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
    },
});

export default ProductListScreen;
