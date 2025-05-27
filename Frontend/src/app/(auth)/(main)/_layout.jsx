import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@components/ui/Text';

const AuthLayout = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.primary }]} edges={['right', 'left', 'top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.headerContainer}>
        <Text variant="heading" fontWeight="600" color="white">
          Hello!
        </Text>
        <Text variant="subheading" color="white">
          Welcome IFUMSAITE!
        </Text>
      </View>

      <View style={[styles.stackWrapper, { backgroundColor: theme.colors.white }]}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.white,
              flex: 1,
              width: '100%',
              height: '100%',
              paddingHorizontal: 0,
              paddingVertical: 0,
              margin: 0,
            },
            animation: 'fade',
            presentation: 'card',
          }}
        >
          <Stack.Screen
            name="login"
            options={{
              title: 'Login',
            }}
          />
          <Stack.Screen
            name="signup"
            options={{
              title: 'Sign Up',
            }}
          />
        </Stack>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  stackWrapper: {
    flex: 1,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    overflow: 'hidden',
    ...(Platform.OS === 'android' && {
      elevation: 4,
    }),
  },
});

export default AuthLayout;
