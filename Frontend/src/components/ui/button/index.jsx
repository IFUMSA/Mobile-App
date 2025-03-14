import React, { useRef } from "react";
import { Pressable, StyleSheet, Animated, Platform } from "react-native";
import { useTheme } from "@hooks/use-theme";
import { Text } from "../Text";

export const Button = ({
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  textProps,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const animateButton = (toValue) => {
    Animated.spring(scaleValue, {
      toValue,
      friction: 7,
      useNativeDriver: Platform.OS !== 'web', // Ensure useNativeDriver is not used on web
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.disabled;
    switch (variant) {
      case "primary":
        return theme.colors.secondary;
      case "secondary":
        return theme.colors.primary;
      case "outlined":
      case "text":
        return "transparent";
      default:
        return theme.colors.secondary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.disabled;
    if (variant === "outlined") {
      return variant === "primary"
        ? theme.colors.primary
        : theme.colors.secondary;
    }
    return "transparent";
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.disabledText;
    switch (variant) {
      case "primary":
      case "secondary":
        return theme.colors.white;
      case "outlined":
      case "text":
        return variant === "primary"
          ? theme.colors.primary
          : theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };

  const getSizeStyles = () =>
    ({
      small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
      },
      medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
      },
      large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
      },
    }[size]);

  const getTextStyles = () =>
    ({
      small: {
        ...theme.typography.caption,
      },
      medium: {
        ...theme.typography.body2,
      },
      large: {
        ...theme.typography.body,
      },
    }[size]);

  const buttonStyles = [
    styles.base,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      ...getSizeStyles(),
    },
    fullWidth && styles.fullWidth,
    variant === "outlined" && styles.outlined,
    disabled && styles.disabled,
    style,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyles,
        pressed && !disabled && styles.pressed,
      ]}
      onPressIn={() => !disabled && animateButton(0.95)}
      onPressOut={() => !disabled && animateButton(1)}
      onPress={onPress}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Text
          variant="button"
          color={getTextColor()}
          style={[styles.label, getTextStyles(), textStyle]}
          {...textProps}
        >
          {children}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderColor: "transparent",
  },
  fullWidth: {
    width: "100%",
  },
  outlined: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
  },
});
