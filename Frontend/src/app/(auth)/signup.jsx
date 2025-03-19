import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Text } from '@components/ui/Text'; // Assuming this is your custom text component

const SignupScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Text variant="heading" fontWeight="600">
          Signup
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export default SignupScreen;