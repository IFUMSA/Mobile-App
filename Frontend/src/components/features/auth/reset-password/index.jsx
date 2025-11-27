import React from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "@components/ui/Input";
import { Button } from "@components/ui/button";
import { useLocalSearchParams } from "expo-router";
import Container from "@components/ui/container";
import AuthHeader from "@components/ui/PageHeader";
import { Text } from "@components/ui/Text";
import ResetPasswordSuccess from "./success";
import { useResetPasswordMutation } from "@api";
import { resetPasswordSchema } from "@lib/validations";

const ResetPasswordForm = () => {
  const { resetToken } = useLocalSearchParams();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { mutate: resetPassword, isPending: isLoading, isSuccess, error: apiError } = useResetPasswordMutation();

  const onSubmit = (data) => {
    resetPassword({ resetToken, newPassword: data.password });
  };

  return (
    <Container>
      {isSuccess ? (
        <ResetPasswordSuccess />
      ) : (
        <>
          <AuthHeader title="New Password" isAuth />
          
          {apiError && (
            <Text variant="body2" style={styles.errorText}>
              {apiError.message || "Failed to reset password. Please try again."}
            </Text>
          )}
          
          <View style={styles.inputsContainer}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="New Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  label="New Password"
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Re-enter your new password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  label="Confirm your new password"
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>
          <Button
            variant="secondary"
            fullWidth
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
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
  errorText: {
    color: "#dc2626",
    marginTop: 12,
  },
});

export default ResetPasswordForm;
