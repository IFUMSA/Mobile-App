import { model, Schema } from "mongoose";

export interface ICard {
  _id?: string;
  userId: string;
  cardType: "mastercard" | "visa" | "other";
  cardName: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CardSchema: Schema = new Schema<ICard>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    cardType: {
      type: String,
      enum: ["mastercard", "visa", "other"],
      default: "other",
    },
    cardName: {
      type: String,
      required: true,
    },
    lastFourDigits: {
      type: String,
      required: true,
      maxlength: 4,
    },
    expiryMonth: {
      type: String,
      required: true,
      maxlength: 2,
    },
    expiryYear: {
      type: String,
      required: true,
      maxlength: 2,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Card = model("Card", CardSchema);
