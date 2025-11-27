import React from "react";
import { ActivityIndicator } from "react-native";
import { ButtonWrapper } from "./ButtonWrapper";
import { ButtonText } from "./ButtonText";

export const Button = ({
  children,
  textStyle,
  textProps,
  size = "medium",
  variant = "primary",
  disabled = false,
  loading = false,
  ...props
}) => {
  // Get text color for loading indicator
  const getLoadingColor = () => {
    if (variant === "primary" || variant === "secondary") {
      return "#fff";
    }
    return "#1F382E";
  };

  return (
    <ButtonWrapper 
      variant={variant} 
      size={size} 
      disabled={disabled || loading} 
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoadingColor()} size="small" />
      ) : (
        <ButtonText
          variant={variant}
          size={size}
          disabled={disabled}
          textStyle={textStyle}
          textProps={textProps}
        >
          {children}
        </ButtonText>
      )}
    </ButtonWrapper>
  );
};

export { ButtonWrapper };
