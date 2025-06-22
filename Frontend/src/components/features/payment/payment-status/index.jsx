import { View, FlatList } from "react-native";
import PageHeader from "@components/ui/PageHeader";
import EachPayment from "./each-payment";
import PaymentStatusSelect from "@components/ui/StatusSelect/PaymentStatusSelect";
import { useState } from "react";

const payments = [
  {
    title: "Payment 1",
    amount: 100,
    date: "2021-01-01",
    status: "success",
  },
  {
    title: "Payment 2",
    amount: 200,
    date: "2021-01-02",
    status: "pending",
  },
  {
    title: "Payment 3",
    amount: 300,
    date: "2021-01-03",
    status: "failed",
  },
  {
    title: "Payment 4",
    amount: 400,
    date: "2021-01-04",
    status: "success",
  },
  {
    title: "Payment 5",
    amount: 500,
    date: "2021-01-05",
    status: "success",
  },
];

const PaymentStatus = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  return (
    <View>
      <PageHeader title="Payment Status" />
      <PaymentStatusSelect
        value={selectedStatus}
        onValueChange={setSelectedStatus}
      />
      <FlatList
        data={payments}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => <EachPayment {...item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default PaymentStatus;
