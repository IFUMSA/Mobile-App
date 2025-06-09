import React from "react";
import { ButtonWrapper } from "./ButtonWrapper";
import { ButtonText } from "./ButtonText";

export const Button = ({
  children,
  textStyle,
  textProps,
  size = "medium",
  variant = "primary",
  disabled = false,
  ...props
}) => {
  return (
    <ButtonWrapper 
      variant={variant} 
      size={size} 
      disabled={disabled} 
      {...props}
    >
      <ButtonText
        variant={variant}
        size={size}
        disabled={disabled}
        textStyle={textStyle}
        textProps={textProps}
      >
        {children}
      </ButtonText>
    </ButtonWrapper>
  );
};

export { ButtonWrapper };
