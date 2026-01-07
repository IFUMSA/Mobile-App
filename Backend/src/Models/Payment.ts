import { model, Schema, Types } from "mongoose";
import { IPayment, PaymentStatus } from "../Interfaces/payment.interface";

const PaymentSchema = new Schema<IPayment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "submitted", "confirmed", "completed", "rejected"],
            default: "pending",
        },
        reference: {
            type: String,
            required: true,
            unique: true,
        },
        productIds: [{
            type: Schema.Types.ObjectId,
            ref: "Product",
        }],
        proofImage: {
            type: String,
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        verifiedAt: {
            type: Date,
        },
        receiptCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        adminNotes: {
            type: String,
        },
    },
    { timestamps: true }
);

// Index for faster queries
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ receiptCode: 1 });

export const Payment = model<IPayment>("Payment", PaymentSchema);
