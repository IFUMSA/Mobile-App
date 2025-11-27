import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Container from '@components/ui/container';
import { useResendVerificationMutation } from '@api';

const VerifyMail = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  
  const { mutate: resendEmail, isPending: isResending, isSuccess: resent } = useResendVerificationMutation();

  const handleResend = () => {
    if (email) {
      resendEmail(email);
    }
  };

  return (
    <Container>
      <View style={styles.content}>
        <Image 
          source={require('@assets/Images/email-icon.png')}
          style={styles.icon}
        />
        <Text variant="heading" style={styles.title}>
          Check your email
        </Text>
        <Text variant="body" style={styles.message}>
          We've sent a verification link to{'\n'}
          <Text variant="body" style={styles.email}>{email || 'your email'}</Text>
        </Text>
        <Text variant="body2" style={styles.subMessage}>
          Click the link in the email to verify your account, then come back and login.
        </Text>

        {resent && (
          <Text variant="body2" style={styles.successText}>
            Verification email sent!
          </Text>
        )}

        <View style={styles.buttons}>
          <Button
            variant="secondary"
            fullWidth
            onPress={() => router.push('/(auth)/(main)/login')}
          >
            Go to Login
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            style={styles.resendButton}
            onPress={handleResend}
            loading={isResending}
          >
            Resend Email
          </Button>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontWeight: '600',
  },
  subMessage: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  successText: {
    color: '#16a34a',
    marginBottom: 16,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  resendButton: {
    marginTop: 8,
  },
});

export default VerifyMail;
