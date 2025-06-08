import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@hooks/use-theme";

export const AppLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
