import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/button";
import { Link } from "expo-router";
import  OTPInput from "@components/ui/Input/otp-input";
import AuthHeader from "@ui/AuthHeader";
import Container from "@components/ui/container";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    // Handle OTP verification logic
    console.log("Verifying OTP:", otp);
  };

  const handleOtpComplete = (completedOtp) => {
    console.log("OTP completed:", completedOtp);
    // Auto-submit when OTP is complete
    // handleVerify();
  };

  const [code, setCode] = useState("");

  return (
    <Container>
      <AuthHeader title="Verification" />
      <Text variant="body2" style={styles.description}>
        Check your mail and enter 4-digit recovery code
      </Text>
      <View style={styles.inputsContainer}>
        <OTPInput onChange={setCode} />
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
    // marginTop: 36,
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
