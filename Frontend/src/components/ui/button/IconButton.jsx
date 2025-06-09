import React from "react";
import { View } from "react-native";
import { ButtonWrapper } from "./ButtonWrapper";
import { ButtonText } from "./ButtonText";

export const IconButton = ({
  icon,
  iconPosition = "left", // "left" or "right"
  iconStyle,
  children,
  textStyle,
  textProps,
  size = "medium",
  variant = "primary",
  disabled = false,
  ...buttonProps
}) => {
  const getIconSpacing = () => {
    return {
      small: 6,
      medium: 8,
      large: 10,
    }[size];
  };

  const iconContainerStyle = {
    alignItems: "center",
    justifyContent: "center",
  };

  const renderContent = () => {
    if (!children && icon) {
      // Icon-only button
      return (
        <View style={iconContainerStyle}>
          {icon}
        </View>
      );
    }

    const iconSpacing = getIconSpacing();

    const textComponent = (
      <ButtonText
        variant={variant}
        size={size}
        disabled={disabled}
        textStyle={textStyle}
        textProps={textProps}
      >
        {children}
      </ButtonText>
    );

    const iconComponent = icon && (
      <View style={iconContainerStyle}>
        {icon}
      </View>
    );

    if (iconPosition === "right") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {textComponent}
          {iconComponent && (
            <View style={[{ marginLeft: iconSpacing }, iconStyle]}>
              {iconComponent}
            </View>
          )}
        </View>
      );
    }

    // Default to left position
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {iconComponent && (
          <View style={[{ marginRight: iconSpacing }, iconStyle]}>
            {iconComponent}
          </View>
        )}
        {textComponent}
      </View>
    );
  };

  return (
    <ButtonWrapper 
      variant={variant} 
      size={size} 
      disabled={disabled} 
      {...buttonProps}
    >
      {renderContent()}
    </ButtonWrapper>
  );
}; 