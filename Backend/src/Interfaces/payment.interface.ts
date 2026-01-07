import { Document, Types } from "mongoose";

export type PaymentStatus = "pending" | "submitted" | "confirmed" | "completed" | "rejected";

export interface IPayment extends Document {
    userId: Types.ObjectId;
    title: string;
    description?: string;
    amount: number;
    status: PaymentStatus;
    reference: string;
    productIds?: Types.ObjectId[];
    proofImage?: string;
    verifiedBy?: Types.ObjectId;
    verifiedAt?: Date;
    receiptCode?: string;
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
