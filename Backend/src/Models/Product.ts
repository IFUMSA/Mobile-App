import { model, Schema, Types } from "mongoose";

export interface IProduct {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  author?: string;
  isAvailable: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", ProductSchema);
