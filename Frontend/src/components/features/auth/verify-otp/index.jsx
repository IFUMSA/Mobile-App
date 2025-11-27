import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/button";
import { useRouter, useLocalSearchParams } from "expo-router";
import OTPInput from "@components/ui/Input/otp-input";
import AuthHeader from "@components/ui/PageHeader";
import Container from "@components/ui/container";
import { useVerifyResetCodeMutation } from "@api";

const VerifyOtp = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const { mutate: verifyCode, isPending: isLoading } = useVerifyResetCodeMutation({
    onSuccess: (data) => {
      router.push({
        pathname: "/(auth)/(recovery)/reset-password",
        params: { resetToken: data.resetToken },
      });
    },
    onError: (err) => {
      setError(err.message || "Invalid code. Please try again.");
    },
  });

  const handleVerify = () => {
    setError("");
    
    if (!code || code.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    verifyCode({ email, code });
  };

  return (
    <Container>
      <AuthHeader title="Verification" isAuth />
      <Text variant="body2" style={styles.description}>
        Check your mail and enter 6-digit recovery code
      </Text>
      
      {error ? (
        <Text variant="body2" style={styles.errorText}>{error}</Text>
      ) : null}
      
      <View style={styles.inputsContainer}>
        <OTPInput onChange={setCode} length={6} />
      </View>
      <Button
        variant="secondary"
        fullWidth
        style={styles.button}
        onPress={handleVerify}
        loading={isLoading}
      >
        Continue
      </Button>
    </Container>
  );
};

const styles = StyleSheet.create({
  description: {
    // marginTop: 36,
  },
  inputsContainer: {
    gap: 32,
    marginTop: 24,
  },
  button: {
    marginTop: 80,
  },
  errorText: {
    color: "#dc2626",
    marginTop: 12,
  },
});

export default VerifyOtp;
