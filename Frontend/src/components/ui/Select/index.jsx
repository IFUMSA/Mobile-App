import React, { forwardRef } from "react";
import { TextInput } from "../Input";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/use-theme";

export const Select = forwardRef(
  (
    { label, error, disabled, required, value, placeholder, onPress, ...rest },
    ref
  ) => {
    const { theme } = useTheme();

    return (
      <TextInput
        ref={ref}
        label={label}
        error={error}
        disabled={disabled}
        required={required}
        value={value}
        placeholder={placeholder}
        onPress={onPress}
        endAdornment={
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? theme.colors.gray : theme.colors.textSecondary}
          />
        }
        {...rest}
      />
    );
  }
);
