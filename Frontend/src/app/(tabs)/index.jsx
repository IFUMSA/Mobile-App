import React from "react";
import { View } from "react-native";
import { useTheme } from "../../hooks/use-theme";
import useCreateStyles from "../../hooks/create-styles";
import { Text } from "../../components/ui/Text";

const HomeScreen = () => {
  const theme = useTheme();

  const styles = useCreateStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
  }));

  return (
    <View style={styles.container}>
      <Text variant="heading" color="textSecondary" uppercase fontWeight={700}>
        Ifumsa mobile App
      </Text>
    </View>
  );
};

export default HomeScreen;
