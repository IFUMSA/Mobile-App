import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { TextInput } from '@components/ui/Input';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/Text';
import { Image } from 'react-native';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    // Handle signup logic here
    console.log('Signup with:', { email, password, confirmPassword });
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
      <Text variant="heading">
        Sign up
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
        <TextInput
          placeholder="Enter Your Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          label="Password"
        />
        <TextInput
          placeholder="Re-enter your Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          label="Confirm Password"
        />
      </View>
      <Button
        variant="secondary"
        fullWidth
        style={styles.signupButton}
        onPress={handleSignup}
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
    marginTop: 80,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputsContainer: {
    gap: 32,
    marginTop: 30,
  },
});

export default SignupForm; 