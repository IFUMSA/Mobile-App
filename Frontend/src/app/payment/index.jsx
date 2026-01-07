import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useCart, useClearCartMutation } from '@api';
import Feather from '@expo/vector-icons/Feather';

const PaymentScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const { data: cartData, isLoading } = useCart();
  const { mutate: clearCart, isPending: isClearing } = useClearCartMutation({
    onSuccess: () => {
      router.push('/payment/status');
    },
  });

  const cart = cartData?.cart;
  const total = cart?.total || 0;
  const itemCount = cart?.items?.length || 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG').format(price);
  };

  const handlePayment = () => {
    // Simulate payment processing
    // In production, integrate with Paystack/Flutterwave
    clearCart();
  };

  if (isLoading) {
    return (
      <Container>
        <PageHeader title="Payment" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      </Container>
    );
  }

  if (itemCount === 0) {
    return (
      <Container>
        <PageHeader title="Payment" />
        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={48} color={theme.colors.gray} />
          <Text variant="body" color="gray" style={styles.emptyText}>
            No items to pay for
          </Text>
          <Button
            variant="secondary"
            onPress={() => router.push('/synopses')}
            style={styles.shopButton}
          >
            Browse Synopses
          </Button>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Payment" />

      <View style={styles.content}>
        <View style={[styles.summaryCard, { borderColor: theme.colors.grayLight }]}>
          <Text variant="body" fontWeight="600" style={styles.summaryTitle}>
            Order Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text variant="body2" color="gray">
              Items ({itemCount})
            </Text>
            <Text variant="body2">₦{formatPrice(total)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.grayLight }]} />
          <View style={styles.summaryRow}>
            <Text variant="body" fontWeight="600">
              Total
            </Text>
            <Text variant="body" fontWeight="700" color="secondary">
              ₦{formatPrice(total)}
            </Text>
          </View>
        </View>

        <View style={[styles.paymentMethodCard, { borderColor: theme.colors.grayLight }]}>
          <Text variant="body" fontWeight="600" style={styles.summaryTitle}>
            Payment Method
          </Text>
          <View style={styles.paymentOption}>
            <View style={[styles.radioSelected, { borderColor: theme.colors.secondary }]}>
              <View style={[styles.radioInner, { backgroundColor: theme.colors.secondary }]} />
            </View>
            <Feather name="credit-card" size={20} color={theme.colors.textSecondary} />
            <Text variant="body2" style={styles.paymentText}>
              Card Payment
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          fullWidth
          onPress={handlePayment}
          loading={isClearing}
        >
          Pay ₦{formatPrice(total)}
        </Button>
      </View>
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
    gap: 20,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  paymentMethodCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentText: {
    marginLeft: 8,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default PaymentScreen;
