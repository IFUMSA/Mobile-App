import { StyleSheet } from "react-native";
import { useContext } from "react";
import { ThemeContext } from "../context/theme-context";

const useCreateStyles = (stylesFn) => {
  const { theme } = useContext(ThemeContext);

  return StyleSheet.create(stylesFn(theme));
};

export default useCreateStyles;
