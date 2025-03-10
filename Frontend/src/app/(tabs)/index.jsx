import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../hooks/use-theme";
import useCreateStyles from "../../hooks/create-styles"

const HomeScreen = () => {
  const theme = useTheme();

  const styles = useCreateStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    heading: {
      ...theme.typography.heading,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Ifumsa, here we go</Text>
    </View>
  );
};

export default HomeScreen;
