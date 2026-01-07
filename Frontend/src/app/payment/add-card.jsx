import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@components/ui/Text';
import { TextInput } from '@components/ui/Input';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSaveCardMutation } from '@hooks/api';

const AddCardScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const [cardType, setCardType] = useState('mastercard');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const saveCardMutation = useSaveCardMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Card added successfully', [
        { text: 'OK', onPress: () => router.push('/payment') },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', error?.message || 'Failed to add card. Please try again.');
    },
  });

  const cardTypes = [
    { id: 'mastercard', label: 'Mastercard' },
    { id: 'visa', label: 'VISA' },
  ];

  // Format card number with spaces
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setExpiryDate(formatExpiryDate(text));
    }
  };

  const handleCvvChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };

  const validateCard = () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }
    if (expiryDate.length < 5) {
      Alert.alert('Error', 'Please enter a valid expiry date');
      return false;
    }
    if (cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const handleAddCard = () => {
    if (!validateCard()) return;

    saveCardMutation.mutate({
      cardType,
      cardName,
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryDate,
    });
  };

  // Mask card number for display
  const displayCardNumber = cardNumber || '**** **** **** ****';
  const displayName = cardName || 'CARDHOLDER NAME';
  const displayExpiry = expiryDate || 'MM/YY';

  return (
    <Container>
      <PageHeader title="Add Card" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Type Selection */}
        <View style={styles.section}>
          <Text variant="body2" fontWeight="500" style={styles.label}>
            Select Card Type
          </Text>
          <View style={styles.cardTypeRow}>
            {cardTypes.map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.cardTypeButton,
                  {
                    borderColor:
                      cardType === type.id
                        ? theme.colors.secondary
                        : theme.colors.grayLight,
                    backgroundColor:
                      cardType === type.id
                        ? 'rgba(42, 153, 107, 0.05)'
                        : '#FFFFFF',
                  },
                ]}
                onPress={() => setCardType(type.id)}
              >
                <Text
                  variant="body2"
                  fontWeight={cardType === type.id ? '600' : '400'}
                  color={cardType === type.id ? 'secondary' : 'textPrimary'}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[
                styles.cardTypeButton,
                { borderColor: theme.colors.grayLight },
              ]}
            >
              <Text variant="caption" color="gray">
                + Add
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Card Preview */}
        <View style={styles.cardPreviewContainer}>
          <LinearGradient
            colors={['#2a996b', '#1f382e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardPreview}
          >
            <View style={styles.cardLogo}>
              <Text variant="caption" color="white" fontWeight="600">
                {cardType === 'mastercard' ? '●●' : 'VISA'}
              </Text>
            </View>
            <Text style={styles.cardNumberPreview}>{displayCardNumber}</Text>
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardLabel}>Cardholder's name</Text>
                <Text style={styles.cardValue}>{displayName.toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Exp Date</Text>
                <Text style={styles.cardValue}>{displayExpiry}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Card Details Form */}
        <View style={styles.formSection}>
          <Text variant="body" fontWeight="600" style={styles.formTitle}>
            Card Details
          </Text>

          <View style={styles.inputGroup}>
            <Text variant="body2" style={styles.inputLabel}>
              Card Name
            </Text>
            <TextInput
              placeholder="Enter cardholder name"
              value={cardName}
              onChangeText={setCardName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="body2" style={styles.inputLabel}>
              Card Number
            </Text>
            <TextInput
              placeholder="**** **** **** ****"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="number-pad"
              maxLength={19}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
              <Text variant="body2" style={styles.inputLabel}>
                Expiry Date
              </Text>
              <TextInput
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={handleExpiryChange}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 0.6 }]}>
              <Text variant="body2" style={styles.inputLabel}>
                CVV
              </Text>
              <TextInput
                placeholder="***"
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          fullWidth
          onPress={handleAddCard}
          loading={saveCardMutation.isPending}
        >
          Add Card
        </Button>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 12,
  },
  cardTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
  },
  cardPreviewContainer: {
    marginBottom: 24,
  },
  cardPreview: {
    borderRadius: 16,
    padding: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  cardLogo: {
    width: 45,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumberPreview: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 20,
  },
  formTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  footer: {
    paddingVertical: 16,
  },
});

export default AddCardScreen;
