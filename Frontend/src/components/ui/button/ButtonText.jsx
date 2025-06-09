import React from "react";
import { Text } from "../Text";
import { useTheme } from "@hooks/use-theme";

export const ButtonText = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  textStyle,
  textProps,
  ...rest
}) => {
  const { theme } = useTheme();

  const getTextColor = () => {
    if (disabled) return theme.colors.disabledText;
    switch (variant) {
      case "primary":
      case "secondary":
        return theme.colors.white;
      case "outlined":
      case "text":
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };

  const getTextStyles = () => {
    const styles = {
      small: {
        ...theme.typography.caption,
      },
      medium: {
        ...theme.typography.body2,
      },
      large: {
        ...theme.typography.body,
      },
    };
    return styles[size] || styles.medium;
  };

  return (
    <Text
      variant="button"
      color={getTextColor()}
      style={[
        {
          textAlign: "center",
          fontWeight: "600",
        },
        getTextStyles(),
        textStyle
      ]}
      {...textProps}
      {...rest}
    >
      {children}
    </Text>
  );
}; 