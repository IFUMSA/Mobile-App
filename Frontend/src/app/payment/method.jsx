import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useCreatePaymentMutation } from '@hooks/api/use-payment';
import Feather from '@expo/vector-icons/Feather';

const PaymentMethodScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('card');

  // Create payment mutation for bank transfer
  const { mutate: createPayment, isPending } = useCreatePaymentMutation({
    onSuccess: (data) => {
      router.push({
        pathname: '/payment/bank-transfer',
        params: {
          paymentId: data.payment.id,
          reference: data.payment.reference,
          amount: data.payment.amount,
          title: data.payment.title,
        },
      });
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create payment');
    },
  });

  const paymentMethods = [
    {
      id: 'card',
      label: 'Card',
      icon: 'credit-card',
      description: 'Pay with debit/credit card',
    },
    {
      id: 'bank',
      label: 'Bank Transfer',
      icon: 'briefcase',
      description: 'Pay via bank transfer',
    },
  ];

  const handleContinue = () => {
    if (selectedMethod === 'card') {
      router.push('/payment/add-card');
    } else {
      // For bank transfer, create payment then go to bank transfer page
      createPayment('bank');
    }
  };

  return (
    <Container>
      <PageHeader title="Payment Method" />

      <View style={styles.content}>
        <Text variant="body" fontWeight="600" style={styles.sectionTitle}>
          Choose Payment Option
        </Text>

        <View style={styles.methodsList}>
          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.methodCard,
                {
                  borderColor:
                    selectedMethod === method.id
                      ? theme.colors.secondary
                      : theme.colors.grayLight,
                  backgroundColor:
                    selectedMethod === method.id
                      ? 'rgba(42, 153, 107, 0.05)'
                      : '#FFFFFF',
                },
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        selectedMethod === method.id
                          ? 'rgba(42, 153, 107, 0.1)'
                          : theme.colors.grayLight,
                    },
                  ]}
                >
                  <Feather
                    name={method.icon}
                    size={22}
                    color={
                      selectedMethod === method.id
                        ? theme.colors.secondary
                        : theme.colors.gray
                    }
                  />
                </View>
                <View style={styles.methodText}>
                  <Text variant="body" fontWeight="500">
                    {method.label}
                  </Text>
                  <Text variant="caption" color="gray">
                    {method.description}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor:
                      selectedMethod === method.id
                        ? theme.colors.secondary
                        : theme.colors.gray,
                  },
                ]}
              >
                {selectedMethod === method.id && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: theme.colors.secondary },
                    ]}
                  />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button variant="secondary" fullWidth onPress={handleContinue} loading={isPending}>
          Continue
        </Button>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  methodsList: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodText: {
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default PaymentMethodScreen;
