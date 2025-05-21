import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "@components/ui/Input";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/Text";
import { Link } from "expo-router";
import Container from "@components/ui/container";
import AuthHeader from "@ui/AuthHeader";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");

  const handleSendCode = () => {
    // Handle sending code logic here
    console.log('Sending code to:', email);
  };

  return (
    <Container>
      <AuthHeader title="Forgot Password?" />
      <Text variant="body2" style={{ marginTop: 36 }}>
        Fill in your email and we'll send a code to reset your password
      </Text>
      <View style={styles.inputsContainer}>
        <TextInput
          placeholder="Enter Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <Link href="/(auth)/(recovery)/verify-otp" asChild>
        <Button
          variant="secondary"
          fullWidth
          style={styles.button}
          onPress={handleSendCode}
        >
          Send code
        </Button>
      </Link>
    </Container>
  );
};

const styles = StyleSheet.create({
  inputsContainer: {
    gap: 32,
    marginTop: 24,
  },
  button: {
    marginTop: 80,
  },
});

export default ForgotPasswordForm; 