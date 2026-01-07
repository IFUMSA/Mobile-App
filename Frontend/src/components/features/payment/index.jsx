import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@components/ui/Text';
import Container from '@components/ui/container';

const Payment = () => {
  return (
    <Container>
      <View style={styles.container}>
        <Text variant="heading">Payment</Text>
        <Text variant="body" style={styles.subtitle}>
          Complete your payment to proceed
        </Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  subtitle: {
    marginTop: 12,
  },
});

export default Payment;
