import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  userName: string;
  firstName: string;
  lastName: string;
  studentClass?: string;
  matricNumber?: string;
  phone?: string;
  level?: string;
  isVerified: boolean;
  verificationToken: string;
  verificationExpires: Date;
  resetCode: string;
  resetCodeExpires: Date;
  resetToken: String;
  resetTokenExpires: Date;
  bio: string;
  profilePic: string;
  hasCompletedOnboarding: boolean;
}
