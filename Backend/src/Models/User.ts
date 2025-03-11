import { Types, model, Schema } from "mongoose";
import { IUser } from "../Interfaces/user.interface";

const UserSchema: Schema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationExpires: {
      type: Date,
      default: null,
    },
    bio: { type: String },
    profilePic: {
      type: String,
      default:
        "https://i.pinimg.com/736x/a8/57/00/a85700f3c614f6313750b9d8196c08f5.jpg",
    },
  },
  {
    timestamps: true,
  }
);

export const User = model("User", UserSchema);
