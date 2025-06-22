import React from "react";
import StatusSelect from "./index";

const paymentStatusOptions = [
  { value: "all", label: "All status" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
];

const PaymentStatusSelect = ({ value, onValueChange, style }) => {
  return (
    <StatusSelect
      value={value}
      onValueChange={onValueChange}
      options={paymentStatusOptions}
      placeholder="All status"
      style={style}
    />
  );
};

export default PaymentStatusSelect; 