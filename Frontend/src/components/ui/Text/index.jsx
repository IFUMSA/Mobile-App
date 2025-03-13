import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "@hooks/use-theme";
import getFontName from "@theme/font-family";

export const Text = ({
  variant = "body1",
  align = "left",
  color,
  noWrap = false,
  uppercase = false,
  fontSize,
  fontWeight: propFontWeight,
  lineHeight,
  letterSpacing,
  fontFamily,
  textDecorationLine,
  textTransform,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();

  const variantStyle = theme.typography[variant];

  const textColor = color && (theme.colors[color] || color);

  const fontName = fontFamily || variantStyle?.fontFamily || "Poppins";

  const fontWeight = propFontWeight || variantStyle?.fontWeight || "400";

  const resolvedFontFamily = getFontName(fontName, fontWeight);

  const textStyles = [
    variantStyle,
    align !== "left" && { textAlign: align },
    textColor && { color: textColor },
    fontSize && { fontSize },
    fontWeight && { fontWeight },
    lineHeight && { lineHeight },
    letterSpacing && { letterSpacing },
    resolvedFontFamily && { fontFamily: resolvedFontFamily },
    textDecorationLine && { textDecorationLine },
    textTransform && { textTransform },
    noWrap && styles.noWrap,
    uppercase && styles.uppercase,
    style,
  ];

  return (
    <RNText style={textStyles} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  noWrap: {
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  uppercase: {
    textTransform: "uppercase",
  },
});
