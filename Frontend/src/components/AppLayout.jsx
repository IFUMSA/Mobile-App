import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useContext } from 'react';
import { ThemeContext } from '../context/theme-context';

export const AppLayout = ({ children }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.colors.background
    }}>
      {children}
      <StatusBar style="dark" />
    </View>
  );
};
