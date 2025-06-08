import React, { forwardRef, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { useTheme } from "@hooks/use-theme";
import { TextInput } from "../Input";
import { Ionicons } from "@expo/vector-icons";
import { SelectModal } from "./SelectModal";

export const ProfileSetupSelect = forwardRef(
  (
    {
      label,
      icon,
      iconColor,
      iconSize = 32,
      placeholder,
      value,
      options = [],
      onValueChange,
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const styles = StyleSheet.create({
      // container: {
      //   marginBottom: 16,
      // },
      iconImage: {
        width: iconSize,
        height: iconSize,
      }
    });

    const defaultIconColor = theme.colors.gray;
    const selectedOption = options.find((option) => option.value === value);

    const renderStartAdornment = () => {
      if (typeof icon === 'string') {
        return (
          <Ionicons
            name={icon}
            size={iconSize}
            color={iconColor || defaultIconColor}
          />
        );
      }
      return (
        <Image 
          source={icon}
          style={styles.iconImage}
          resizeMode="contain"
        />
      );
    };

    return (
      <View style={styles.container}>
        <TextInput
          ref={ref}
          label={label}
          innerLabel={true}
          showSlash={true}
          placeholder={placeholder}
          value={selectedOption?.label || ""}
          onPress={() => setIsOpen(true)}
          startAdornment={renderStartAdornment()}
          endAdornment={
            <Ionicons
              name="chevron-down"
              size={16}
              color={theme.colors.black}
            />
          }
          style={{
            ...theme.typography.body2,
            lineHeight: 21,
          }}
          {...rest}
        />

        <SelectModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={label}
          options={options}
          value={value}
          onSelect={onValueChange}
        />
      </View>
    );
  }
);

ProfileSetupSelect.displayName = "ProfileSetupSelect";