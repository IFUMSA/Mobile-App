import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "@components/ui/Input";
import { Button } from "@components/ui/button";
import { Link } from "expo-router";
import Container from "@components/ui/container";
import AuthHeader from "@ui/AuthHeader";
import ResetPasswordSuccess from "./success";

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetPasswordSuccess, setIsResetPasswordSuccess] = useState(true);

  const handleResetPassword = () => {
    // Handle reset password logic here
    console.log("Reset password with:", { password, confirmPassword });
  };

  return (
    <Container>
      {isResetPasswordSuccess ? (
        <ResetPasswordSuccess />
      ) : (
        <>
          <AuthHeader title="New Password" />
          <View style={styles.inputsContainer}>
            <TextInput
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              label="New Password"
            />
            <TextInput
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              label="Confirm your new password"
            />
          </View>
          <Button
            variant="secondary"
            fullWidth
            style={styles.button}
            onPress={handleResetPassword}
          >
            Reset Password
          </Button>
        </>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  inputsContainer: {
    gap: 32,
  },
  button: {
    marginTop: 80,
  },
});

export default ResetPasswordForm;
