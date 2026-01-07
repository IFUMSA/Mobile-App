import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@components/ui/Text";
import PageHeader from "@components/ui/PageHeader";
import EachPayment from "./each-payment";
import PaymentStatusSelect from "@components/ui/StatusSelect/PaymentStatusSelect";
import { useState } from "react";
import { useTheme } from "@hooks/use-theme";
import { usePaymentHistory } from "@hooks/api";
import Feather from "@expo/vector-icons/Feather";
import { Button } from "@components/ui/button";

const PaymentStatus = () => {
  const { theme } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetch payment history from API
  const { data, isLoading, error, refetch } = usePaymentHistory(selectedStatus);
  const payments = data?.payments || [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Payment Status" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <PageHeader title="Payment Status" />
        <View style={styles.emptyContainer}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Text variant="body" color="gray" style={styles.emptyText}>
            Failed to load payments
          </Text>
          <Button variant="secondary" onPress={() => refetch()}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Payment Status" />
      <PaymentStatusSelect
        value={selectedStatus}
        onValueChange={setSelectedStatus}
      />
      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="credit-card" size={48} color={theme.colors.gray} />
          <Text variant="body" color="gray" style={styles.emptyText}>
            No {selectedStatus === "all" ? "" : selectedStatus} payments found
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EachPayment {...item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default PaymentStatus;
