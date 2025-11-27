import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@components/ui/Input';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/Text';
import { useSigninMutation } from '@api';
import { useAuth } from '@hooks/use-auth';
import { loginSchema } from '@lib/validations';

const LoginForm = () => {
  const router = useRouter();
  const { setAuthData } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const { mutate: signin, isPending: isLoading, error: apiError } = useSigninMutation({
    onSuccess: async (data) => {
      // Store token and user in context
      await setAuthData({ token: data.token, user: data.user });
      router.replace('/home');
    },
  });

  const onSubmit = (data) => signin(data);

  return (
    <View style={styles.container}>
      <Text variant="heading">Login</Text>

      {apiError && (
        <Text variant="body2" style={styles.errorText}>
          {apiError.message?.includes('Not Verified')
            ? 'Please verify your email before logging in'
            : apiError.message || 'Login failed. Please try again.'}
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
              label="Email"
              error={errors.email?.message}
            />
          )}
        />
        <View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Your Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                label="Password"
                error={errors.password?.message}
              />
            )}
          />

          <Link href="/(auth)/(recovery)/forgot-password" asChild>
            <Pressable style={styles.forgotPasswordContainer}>
              <Text variant="body2">Forgot Password?</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <Button
        variant="secondary"
        fullWidth
        style={styles.loginButton}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
      >
        Login
      </Button>

      <View style={styles.signupContainer}>
        <Text variant="body2" color="textSecondary">
          Don't have an account?{' '}
        </Text>
        <Link href="/(auth)/(main)/signup" asChild>
          <Pressable>
            <Text variant="body2" color="secondary">
              Sign up
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  inputsContainer: {
    gap: 32,
    marginTop: 30,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  loginButton: {
    marginTop: 80,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 12,
  },
});

export default LoginForm; 