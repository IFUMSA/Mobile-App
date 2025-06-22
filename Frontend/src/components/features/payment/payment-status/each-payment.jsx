import { View } from "react-native";
import { Text } from "@components/ui/Text";
import { useTheme } from "@hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Container from "@components/ui/container";
import { StyleSheet } from "react-native";

const EachPayment = ({ title, amount, date, status }) => {
  const { theme } = useTheme();

  const statusColor = (() => {
    switch (status) {
      case "success":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      case "failed":
        return theme.colors.error;
      default:
        return theme.colors.success;
    }
  })();

  return (
    <View
      style={[
        styles.wrapper,
        { borderBottomColor: theme.colors.secondaryAlpha[10] },
      ]}
    >
      <Container style={styles.container}>
        <View>
          <Text variant="body2">{title}</Text>
          <Text variant="caption" fontSize={10}>
            {date}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <MaterialCommunityIcons
            name="currency-ngn"
            size={24}
            color={statusColor}
          />
          <Text variant="body" fontSize={20} lineHeight="28" color={statusColor}>
            {amount}
          </Text>
        </View>
      </Container>
    </View>
  );
};

export default EachPayment;

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 78,
    height: 30,
  },
});
