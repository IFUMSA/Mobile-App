import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import { Link } from 'expo-router';
import { TextInput } from '@components/ui/Input';
import AuthHeader from "@ui/AuthHeader";
import Container from "@components/ui/container";

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    // Handle OTP verification logic
    console.log('Verifying OTP:', otp);
  };

  return (
    <Container>
      <AuthHeader title="Verification" />
      <Text variant="body2" style={styles.description}>
        Check your mail and enter 4-digit recovery code
      </Text>
      <View style={styles.inputsContainer}>
        <TextInput
          placeholder="Enter 4-digit code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>
      <Link href="/(auth)/(recovery)/reset-password" asChild>
        <Button
          variant="secondary"
          fullWidth
          style={styles.button}
          onPress={handleVerify}
        >
          Continue
        </Button>
      </Link>
    </Container>
  );
};

const styles = StyleSheet.create({
  description: {
    marginTop: 36,
  },
  inputsContainer: {
    gap: 32,
    marginTop: 24,
  },
  button: {
    marginTop: 80,
  },
});

export default VerifyOtp;
