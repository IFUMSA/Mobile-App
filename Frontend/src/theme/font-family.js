const getFontName = (fontFamily, fontWeight) => {
  const fontMap = {
    PlayfairDisplay: {
      400: "PlayfairDisplay_400Regular",
      500: "PlayfairDisplay_500Medium",
      600: "PlayfairDisplay_600SemiBold",
      700: "PlayfairDisplay_700Bold",
    },
    Poppins: {
      400: "Poppins_400Regular",
      500: "Poppins_500Medium",
      600: "Poppins_600SemiBold",
      700: "Poppins_700Bold",
    },
  };

  return fontMap[fontFamily]?.[fontWeight] || fontFamily;
};

export default getFontName;
