import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/PageHeader';
import { useTheme } from '@hooks/use-theme';
import { useBankDetails, useSubmitProofMutation } from '@hooks/api/use-payment';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';

const BankTransferScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { paymentId, reference, amount, title } = params;

  const [proofImage, setProofImage] = useState(null);

  const { data: bankData, isLoading: bankLoading } = useBankDetails();
  const { mutate: submitProof, isPending: isSubmitting } = useSubmitProofMutation({
    onSuccess: () => {
      Alert.alert(
        'Proof Submitted',
        'Your payment proof has been submitted. We will verify and confirm your payment shortly.',
        [{ text: 'OK', onPress: () => router.push('/payment/status') }]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to submit proof');
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG').format(price);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setProofImage(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    if (!proofImage?.base64) {
      Alert.alert('Error', 'Please upload proof of payment');
      return;
    }

    submitProof({
      paymentId,
      proofImage: `data:image/jpeg;base64,${proofImage.base64}`,
    });
  };

  const copyToClipboard = async (text) => {
    // In a real app, use Clipboard API
    Alert.alert('Copied', text);
  };

  return (
    <Container>
      <PageHeader title="Bank Transfer" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Payment Info */}
          <View style={[styles.card, { borderColor: theme.colors.grayLight }]}>
            <Text variant="body" fontWeight="600" style={styles.cardTitle}>
              Payment Details
            </Text>
            <View style={styles.infoRow}>
              <Text variant="body2" color="gray">Description</Text>
              <Text variant="body2">{title || 'Annual Dues'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="body2" color="gray">Amount</Text>
              <Text variant="body" fontWeight="700" color="secondary">
                ₦{formatPrice(amount || 1000)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="body2" color="gray">Reference</Text>
              <Pressable onPress={() => copyToClipboard(reference)}>
                <Text variant="body2" color="secondary">{reference}</Text>
              </Pressable>
            </View>
          </View>

          {/* Bank Details */}
          <View style={[styles.card, { borderColor: theme.colors.grayLight }]}>
            <Text variant="body" fontWeight="600" style={styles.cardTitle}>
              Bank Account Details
            </Text>
            {bankLoading ? (
              <Text variant="body2" color="gray">Loading...</Text>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text variant="body2" color="gray">Bank</Text>
                  <Text variant="body2">{bankData?.bankName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text variant="body2" color="gray">Account Number</Text>
                  <Pressable onPress={() => copyToClipboard(bankData?.accountNumber)}>
                    <Text variant="body2" color="secondary">{bankData?.accountNumber}</Text>
                  </Pressable>
                </View>
                <View style={styles.infoRow}>
                  <Text variant="body2" color="gray">Account Name</Text>
                  <Text variant="body2">{bankData?.accountName}</Text>
                </View>
                <Text variant="caption" color="gray" style={styles.note}>
                  {bankData?.note}
                </Text>
              </>
            )}
          </View>

          {/* Upload Proof */}
          <View style={[styles.card, { borderColor: theme.colors.grayLight }]}>
            <Text variant="body" fontWeight="600" style={styles.cardTitle}>
              Upload Payment Proof
            </Text>
            <Text variant="caption" color="gray" style={{ marginBottom: 16 }}>
              After making the transfer, upload a screenshot or receipt as proof.
            </Text>

            {proofImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: proofImage.uri }} style={styles.proofImage} />
                <Pressable
                  style={[styles.changeButton, { backgroundColor: theme.colors.grayLight }]}
                  onPress={pickImage}
                >
                  <Text variant="caption">Change Image</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.uploadButton, { borderColor: theme.colors.secondary }]}
                onPress={pickImage}
              >
                <Feather name="upload" size={24} color={theme.colors.secondary} />
                <Text variant="body2" color="secondary" style={{ marginTop: 8 }}>
                  Tap to upload proof
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          fullWidth
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!proofImage}
        >
          Submit Proof
        </Button>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  note: {
    marginTop: 12,
    fontStyle: 'italic',
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default BankTransferScreen;
