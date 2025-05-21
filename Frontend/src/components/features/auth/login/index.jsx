import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { TextInput } from '@components/ui/Input';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/Text';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Handle login logic here
    console.log('Login with:', { email, password });
  };

  return (
    <View style={styles.container}>
      <Text variant="heading">
        Login
      </Text>

      <View style={styles.inputsContainer}>
        <TextInput
          placeholder="Enter Your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          label="Email"
        />
        <View>
          <TextInput
            placeholder="Enter Your Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            label="Password"
          />

          <Link href="/(auth)/(recovery)/forgot-password" asChild>
            <Pressable style={styles.forgotPasswordContainer}>
              <Text variant="body2">
                Forgot Password?
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <Button
        variant="secondary"
        fullWidth
        style={styles.loginButton}
        onPress={handleLogin}
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
});

export default LoginForm; 