import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '@components/ui/Text';
import { useState } from 'react';
import VerificationSuccess from './success';
import Container from '@components/ui/container';

const VerifyMail = () => {
    const [isVerified, setIsVerified] = useState(true);
  return (
    <Container>
    {
       isVerified ? (
        <VerificationSuccess />
       ) : (
      <View style={styles.content}>
        <Image 
          source={require('@assets/Images/email-icon.png')}
          style={styles.icon}
        />
        <Text variant="body" style={styles.message}>
          You have a mail. Check your inbox to verify your email.
        </Text>
      </View>
      )
    }
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  message: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 28,
  }
});

export default VerifyMail;
