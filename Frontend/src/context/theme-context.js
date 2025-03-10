import React, { createContext, useState, useMemo } from "react";
import { theme } from "../theme/theme";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(theme);

  const contextValue = useMemo(
    () => ({
      theme: currentTheme,
    }),
    [currentTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
