"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react";

interface Payment {
  _id: string;
  id?: string;
  reference: string;
  title: string;
  amount: number;
  status: string;
  userId: { _id: string; email: string; firstName: string } | string;
  proofImage?: string;
  createdAt: string;
}

interface PaymentApprovalProps {
  payment: Payment;
  onApprovalSuccess?: () => void;
}

export function PaymentApproval({ payment, onApprovalSuccess }: PaymentApprovalProps) {
  const queryClient = useQueryClient();
  const [approvalMessage, setApprovalMessage] = useState<string>("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const updatePaymentMutation = useMutation({
    mutationFn: async (status: "confirmed" | "rejected") => {
      const response = await axios.post(
        `/api/payment/update-status`,
        {
          reference: payment.reference,
          status,
          approvalMessage: status === "confirmed" ? approvalMessage : undefined,
        },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onApprovalSuccess?.();
    },
  });

  const handleApprove = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!approvalMessage.trim()) {
      setErrorMessage("Please enter a message for the user");
      return;
    }

    try {
      await updatePaymentMutation.mutateAsync("confirmed");
      setSuccessMessage("Payment approved successfully!");
      setShowApprovalModal(false);
      setApprovalMessage("");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Failed to approve payment"
      );
    }
  };

  const handleReject = async () => {
    if (window.confirm("Are you sure you want to reject this payment?")) {
      try {
        await updatePaymentMutation.mutateAsync("rejected");
        setSuccessMessage("Payment rejected successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } catch (err: any) {
        setErrorMessage(
          err.response?.data?.message || "Failed to reject payment"
        );
      }
    }
  };

  if (payment.status !== "submitted") {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {errorMessage}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Payment Awaiting Approval</h3>
          <p className="text-sm text-gray-600 mt-1">
            Reference: {payment.reference}
          </p>
          {payment.proofImage && (
            <a
              href={payment.proofImage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block underline"
            >
              View Payment Proof
            </a>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowApprovalModal(true)}
            disabled={updatePaymentMutation.isPending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
          >
            <CheckCircle size={18} />
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={updatePaymentMutation.isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
          >
            <XCircle size={18} />
            Reject
          </button>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MessageSquare size={24} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Approve Payment
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Add a message to notify the user about next steps after approval.
              </p>

              <textarea
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                placeholder="E.g., 'Meet the Treasurer to collect your receipt' or 'Visit the AGS office for your merchandise'"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={5}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This message will be sent to the user in their
                  approval notification (in-app and email).
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={updatePaymentMutation.isPending || !approvalMessage.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition font-medium"
                >
                  {updatePaymentMutation.isPending
                    ? "Approving..."
                    : "Approve Payment"}
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
