import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '@components/ui/Text';
import { Button } from '@components/ui/button';
import { Link } from 'expo-router';

const VerificationSuccess = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('@assets/Images/verified-account.png')}
          style={styles.icon}
        />
        <Text fontSize={28} style={styles.title}>
          Verification Successful
        </Text>
        <Text variant='body' fontSize={18} style={styles.message}>
          You've successfully verified your email
        </Text>
      </View>
      
      <Link href="/(auth)/(main)/login" asChild>
        <Button 
          variant="secondary" 
          fullWidth
        >
          Back to Login
        </Button>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    maxHeight: '65%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 28,
  },
  message: {
    textAlign: 'center',
  }
});

export default VerificationSuccess;
