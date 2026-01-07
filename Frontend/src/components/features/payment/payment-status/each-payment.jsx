import { View } from "react-native";
import { Text } from "@components/ui/Text";
import { useTheme } from "@hooks/use-theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Container from "@components/ui/container";
import { StyleSheet } from "react-native";

const EachPayment = ({ title, amount, date, status }) => {
  const { theme } = useTheme();

  // Map status to color and display text
  const getStatusInfo = () => {
    switch (status) {
      case "completed":
      case "success":
        return { color: theme.colors.success, label: "Completed" };
      case "confirmed":
        return { color: theme.colors.success, label: "Confirmed" };
      case "submitted":
        return { color: theme.colors.info || "#3B82F6", label: "Under Review" };
      case "pending":
        return { color: theme.colors.warning, label: "Pending" };
      case "rejected":
      case "failed":
        return { color: theme.colors.error, label: "Rejected" };
      default:
        return { color: theme.colors.gray, label: status };
    }
  };

  const { color: statusColor, label: statusLabel } = getStatusInfo();

  return (
    <View
      style={[
        styles.wrapper,
        { borderBottomColor: theme.colors.secondaryAlpha[10] },
      ]}
    >
      <Container style={styles.container}>
        <View style={styles.leftContent}>
          <Text variant="body2">{title}</Text>
          <Text variant="caption" fontSize={10}>
            {date}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text variant="caption" fontSize={10} style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <MaterialCommunityIcons
            name="currency-ngn"
            size={24}
            color={statusColor}
          />
          <Text variant="body" fontSize={20} lineHeight="28" style={{ color: statusColor }}>
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
    paddingVertical: 10,
  },
  leftContent: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 78,
    height: 30,
  },
});
