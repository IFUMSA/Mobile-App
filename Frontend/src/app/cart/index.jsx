import React from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useCart, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@api';
import Feather from '@expo/vector-icons/Feather';

const CartScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const { data: cartData, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItemMutation();
  const { mutate: removeItem } = useRemoveFromCartMutation();

  const cart = cartData?.cart;
  const items = cart?.items || [];
  const total = cart?.total || 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG').format(price);
  };

  const handleUpdateQuantity = (productId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateItem({ productId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (productId) => {
    removeItem(productId);
  };

  const handleCheckout = () => {
    router.push('/payment/method');
  };

  const renderCartItem = ({ item }) => {
    const product = item.productId;

    return (
      <View style={[styles.cartItem, { borderColor: theme.colors.grayLight }]}>
        <View style={styles.itemImage}>
          {product?.image && (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text variant="body" fontWeight="600" numberOfLines={2}>
            {product?.title || 'Product'}
          </Text>
          <Text variant="body2" color="textSecondary" style={styles.itemPrice}>
            ₦{formatPrice(item.price)}
          </Text>
          <View style={styles.quantityContainer}>
            <Pressable
              style={[styles.quantityButton, { borderColor: theme.colors.grayLight }]}
              onPress={() => handleUpdateQuantity(product?._id, item.quantity, -1)}
            >
              <Feather name="minus" size={16} color={theme.colors.textSecondary} />
            </Pressable>
            <Text variant="body" style={styles.quantityText}>
              {item.quantity}
            </Text>
            <Pressable
              style={[styles.quantityButton, { borderColor: theme.colors.grayLight }]}
              onPress={() => handleUpdateQuantity(product?._id, item.quantity, 1)}
            >
              <Feather name="plus" size={16} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
        </View>
        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemoveItem(product?._id)}
        >
          <Feather name="trash-2" size={20} color={theme.colors.error} />
        </Pressable>
      </View>
    );
  };

  if (isLoading) {
    return (
      <Container>
        <PageHeader title="Cart" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Cart" />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={48} color={theme.colors.gray} />
          <Text variant="body" color="gray" style={styles.emptyText}>
            Your cart is empty
          </Text>
          <Button
            variant="secondary"
            onPress={() => router.push('/synopses')}
            style={styles.shopButton}
          >
            Browse Synopses
          </Button>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => item.productId?._id || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cartList}
          />

          <View style={[styles.footer, { borderColor: theme.colors.grayLight }]}>
            <View style={styles.totalContainer}>
              <Text variant="body" color="gray">
                Total
              </Text>
              <Text variant="heading2" fontWeight="700">
                ₦{formatPrice(total)}
              </Text>
            </View>
            <Button variant="secondary" fullWidth onPress={handleCheckout}>
              Proceed to Checkout
            </Button>
          </View>
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
    marginBottom: 24,
  },
  shopButton: {
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
  },
  cartList: {
    gap: 12,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  itemImage: {
    width: 70,
    height: 90,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemPrice: {
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default CartScreen;
