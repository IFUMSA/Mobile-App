import React from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "@components/ui/Input";
import { Button } from "@components/ui/button";
import { Text } from "@components/ui/Text";
import Container from "@components/ui/container";
import AuthHeader from "@components/ui/PageHeader";
import { useRouter } from "expo-router";
import { useForgotPasswordMutation } from "@api";
import { forgotPasswordSchema } from "@lib/validations";

const ForgotPasswordForm = () => {
  const router = useRouter();

  const { control, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: "" },
  });

  const { mutate: forgotPassword, isPending: isLoading, error: apiError } = useForgotPasswordMutation({
    onSuccess: () => {
      router.push({
        pathname: "/(auth)/(recovery)/verify-otp",
        params: { email: getValues("email") },
      });
    },
  });

  const onSubmit = (data) => forgotPassword(data.email);

  return (
    <Container>
      <AuthHeader title="Forgot Password?" isAuth />
      <Text variant="body2">
        Fill in your email and we'll send a code to reset your password
      </Text>
      
      {apiError && (
        <Text variant="body2" style={styles.errorText}>
          {apiError.message || "Failed to send code. Please try again."}
        </Text>
      )}
      
      <View style={styles.inputsContainer}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Enter Your Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
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
        Send code
      </Button>
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
  errorText: {
    color: "#dc2626",
    marginTop: 12,
  },
});

export default ForgotPasswordForm; 