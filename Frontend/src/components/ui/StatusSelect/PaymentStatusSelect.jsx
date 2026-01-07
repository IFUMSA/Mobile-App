import React from "react";
import StatusSelect from "./index";

const paymentStatusOptions = [
  { value: "all", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Under Review" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
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