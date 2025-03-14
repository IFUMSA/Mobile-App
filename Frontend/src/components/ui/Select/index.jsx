import React, { forwardRef, useState } from "react";
import { TextInput } from "../Input";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/use-theme";
import { SelectModal } from "./SelectModal";

export const Select = forwardRef(
  (
    {
      label,
      error,
      disabled,
      required,
      value,
      placeholder,
      options = [],
      onValueChange,
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
      if (!disabled) {
        setIsOpen(true);
      }
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    const selectedOption = options.find((option) => option.value === value);

    return (
      <>
        <TextInput
          ref={ref}
          label={label}
          error={error}
          disabled={disabled}
          required={required}
          value={selectedOption?.label || ""}
          placeholder={placeholder}
          onPress={handleOpen}
          endAdornment={
            <Ionicons
              name="chevron-down"
              size={20}
              color={disabled ? theme.colors.gray : theme.colors.textSecondary}
            />
          }
          style={{
            borderRadius: 8,
          }}
          labelStyle={{
            marginBottom: 2,
          }}
          {...rest}
        />

        <SelectModal
          isOpen={isOpen}
          onClose={handleClose}
          title={label}
          options={options}
          value={value}
          onSelect={onValueChange}
        />
      </>
    );
  }
);
