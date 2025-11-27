import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@components/ui/Input';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/Text';
import { Image } from 'react-native';
import { useSignupMutation } from '@api';
import { signupSchema } from '@lib/validations';

const SignupForm = () => {
  const router = useRouter();

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange', // Validate on every change
    defaultValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // React Query mutation
  const { mutate: signup, isPending: isLoading, isSuccess: success, error: apiError } = useSignupMutation({
    onSuccess: (_, variables) => {
      // Redirect to verify-mail screen with email
      router.push({
        pathname: '/(auth)/verify-mail',
        params: { email: variables.email },
      });
    },
  });

  const onSubmit = (data) => {
    const { firstName, lastName, userName, email, password } = data;
    signup({ email, password, userName, firstName, lastName });
  };

  return (
    <View style={styles.container}>
      <Link href="/(auth)/(main)/login" asChild>
        <Pressable style={styles.loginContainer}>
          <Image source={require('@assets/icons/back-icon.png')} width={24} height={24} />
          <Text variant="body2" color="primary">
            Back to Login
          </Text>
        </Pressable>
      </Link>
      <Text variant="heading">Sign up</Text>
      
      {success ? (
        <Text variant="body2" style={styles.successText}>
          Account created! Redirecting to login...
        </Text>
      ) : (
        <>
          {apiError && (
            <Text variant="body2" style={styles.errorText}>
              {apiError.message || 'Signup failed. Please try again.'}
            </Text>
          )}
        </>
      )}
      
      <View style={styles.inputsContainer}>
        <View style={styles.nameRow}>
          <View style={styles.nameInput}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="First Name"
                  value={value}
                  onChangeText={onChange}
                  label="First Name"
                  error={errors.firstName?.message}
                />
              )}
            />
          </View>
          <View style={styles.nameInput}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Last Name"
                  value={value}
                  onChangeText={onChange}
                  label="Last Name"
                  error={errors.lastName?.message}
                />
              )}
            />
          </View>
        </View>
        
        <Controller
          control={control}
          name="userName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Choose a username"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              label="Username"
              error={errors.userName?.message}
            />
          )}
        />
        
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
        
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Re-enter your Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              label="Confirm Password"
              error={errors.confirmPassword?.message}
            />
          )}
        />
      </View>
      
      <Button
        variant="secondary"
        fullWidth
        style={styles.signupButton}
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
      >
        Sign up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  signupButton: {
    marginTop: 40,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputsContainer: {
    gap: 20,
    marginTop: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 12,
  },
  successText: {
    color: '#16a34a',
    marginTop: 12,
  },
});

export default SignupForm; 