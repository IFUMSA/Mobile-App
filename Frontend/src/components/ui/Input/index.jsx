import React, { forwardRef, useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { useTheme } from "@hooks/use-theme";
import { Text } from "../Text";

export const TextInput = forwardRef(
  (
    {
      label,
      labelColor,
      error,
      disabled = false,
      required = false,
      helperText,
      startAdornment,
      endAdornment,
      style,
      labelStyle,
      labelTextStyle,
      optionTextStyle,
      helperTextStyle,
      placeholder,
      placeholderTextColor,
      showSlash,
      innerLabel = false,
      onFocus,
      onBlur,
      onPress,
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };
    const getPaddingLeft = () => {
      if (startAdornment) {
        return showSlash ? 88 : 40;
      }
      return 16;
    };

    const getPaddingRight = () => {
      return endAdornment ? 40 : 16;
    };

    const getPaddingTop = () => {
      return innerLabel ? 32 : 14;
    };

    const styles = StyleSheet.create({
      wrapper: {
        width: "100%",
      },
      labelContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
      },
      required: {
        color: theme.colors.error,
        marginLeft: 4,
      },
      inputContainer: {
        position: "relative",
        width: "100%",
      },
      input: {
        width: "100%",
        paddingTop: getPaddingTop(),
        paddingBottom: innerLabel ? 10 : 14,
        paddingLeft: getPaddingLeft(),
        paddingRight: getPaddingRight(),
        borderWidth: 1,
        borderColor: error
          ? theme.colors.error
          : disabled
          ? theme.colors.grayAlpha[50]
          : isFocused
          ? theme.colors.primary
          : theme.colors.primaryAlpha[50],
        borderRadius: 16,
        height: innerLabel ? 64 : 48,
        backgroundColor: theme.colors.white,
        opacity: disabled ? 0.5 : 1,
        color: theme.colors.textSecondary,
      },
      innerLabel: {
        position: "absolute",
        top: 8,
        left: startAdornment ? (showSlash ? 88 : 40) : 16,
        zIndex: 1,
        color: theme.colors.grayAlpha[50],
      },
      startAdornment: {
        position: "absolute",
        top: 0,
        left: 16,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
      },
      endAdornment: {
        position: "absolute",
        top: 0,
        right: 16,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: getPaddingTop(),
        paddingBottom: innerLabel ? 8 : 14,
        zIndex: 1,
      },
      slash: {
        position: "absolute",
        left: 64,
        top: 10,
        height: 44,
        width: 1,
        backgroundColor: theme.colors.black,
        zIndex: 1,
      },
      helperText: {
        marginTop: 8,
      },
    });

    return (
      <View style={styles.wrapper}>
        {!innerLabel && label && (
          <View style={[styles.labelContainer, labelStyle]}>
            <Text
              variant="body2"
              color={
                error
                  ? "error"
                  : disabled
                  ? "gray"
                  : isFocused
                  ? "primary"
                  : "textSecondary"
              }
              style={labelTextStyle}
            >
              {label}
            </Text>
            {required && (
              <Text variant="body2" style={styles.required} lineHeight={20}>
                *
              </Text>
            )}
          </View>
        )}

        <View style={styles.inputContainer}>
          {innerLabel && label && (
            <View style={[styles.innerLabel, labelStyle]}>
              <Text
                variant="body2"
                color={theme.colors.grayAlpha[50]}
                style={labelTextStyle}
              >
                {label}
                {required && "*"}
              </Text>
            </View>
          )}

          {startAdornment && (
            <View style={styles.startAdornment}>{startAdornment}</View>
          )}

          {showSlash && startAdornment && <View style={styles.slash}></View>}

          {endAdornment && (
            <View style={styles.endAdornment}>{endAdornment}</View>
          )}

          {onPress ? (
            <Pressable onPress={onPress} disabled={disabled}>
              <View style={[styles.input, style]} pointerEvents="none">
                <Text
                  color={rest.value ? "textSecondary" : "gray"}
                  numberOfLines={1}
                  style={optionTextStyle}
                >
                  {rest.value || placeholder || ""}
                </Text>
              </View>
            </Pressable>
          ) : (
            <RNTextInput
              ref={ref}
              style={[styles.input, style]}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor || theme.colors.gray}
              editable={!disabled}
              selectionColor={theme.colors.primary}
              onFocus={handleFocus}
              onBlur={handleBlur}
              underlineColorAndroid="transparent"
              {...rest}
            />
          )}
        </View>

        {error && typeof error === 'string' && (
          <Text
            variant="caption"
            color="error"
            style={styles.helperText}
          >
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text
            variant="caption"
            color="gray"
            style={[styles.helperText, helperTextStyle]}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = "TextInput";
