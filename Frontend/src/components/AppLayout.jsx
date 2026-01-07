import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@hooks/use-theme";
import { AuthGuard } from "./AuthGuard";

export const AppLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <AuthGuard>{children}</AuthGuard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
