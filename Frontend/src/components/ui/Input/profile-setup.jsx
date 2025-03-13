import React, { forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@hooks/use-theme";
import { TextInput } from ".";
import { Ionicons } from "@expo/vector-icons";

export const ProfileSetupInput = forwardRef(
  ({ label, icon, iconColor, iconSize = 32, placeholder, ...rest }, ref) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      container: {
        marginBottom: 16,
      },
    });

    const defaultIconColor = theme.colors.gray;

    return (
      <View style={styles.container}>
        <TextInput
          ref={ref}
          label={label}
          innerLabel={true}
          showSlash={true}
          placeholder={placeholder}
          startAdornment={
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor || defaultIconColor}
            />
          }
          style={{
            ...theme.typography.body2,
            lineHeight: 21,
          }}
          {...rest}
        />
      </View>
    );
  }
);
