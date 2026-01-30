import { Types, model, Schema } from "mongoose";

interface INotification {
  _id?: Types.ObjectId;
  type: "event" | "payment" | "payment_approval" | "reminder";
  recipientId: Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    eventId?: Types.ObjectId;
    paymentId?: Types.ObjectId;
    approvalMessage?: string;
    eventName?: string;
    itemName?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["event", "payment", "payment_approval", "reminder"],
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        default: null,
      },
      paymentId: {
        type: Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
      },
      approvalMessage: {
        type: String,
        default: null,
      },
      eventName: {
        type: String,
        default: null,
      },
      itemName: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export const Notification = model("Notification", NotificationSchema);
