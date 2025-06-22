const baseColors = {
  textPrimary: "#FFFFFF",
  textSecondary: "#1F382E",
  primary: "#1F382E",
  secondary: "#2A996B",
  black: "#000000",
  gray: "#C1C1C1",
  white: "#FFFFFF",
  text: "#11181C",
  icon: "#687076",
  modalOverlay: "rgba(7, 13, 11, 0.5)",
  success: "#2A996B",
  error: "#F84F4F",
  grayLight: "#D9D9D9",
  pending: "#F79E1B",
};

const createAlphaVariants = (hexColor, alphaLevels) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return Object.fromEntries(
    alphaLevels.map((level) => [
      level,
      `rgba(${r}, ${g}, ${b}, ${level / 100})`,
    ])
  );
};

export const colors = {
  ...baseColors,
  background: baseColors.white,
  primaryAlpha: createAlphaVariants(baseColors.primary, [50]),
  secondaryAlpha: createAlphaVariants(baseColors.secondary, [2, 10, 80]),
  blackAlpha: createAlphaVariants(baseColors.black, [2]),
  grayAlpha: createAlphaVariants(baseColors.gray, [50]),
  grayLightAlpha: createAlphaVariants(baseColors.grayLight, [50]),
  whiteAlpha: createAlphaVariants(baseColors.white, [90]),
};
