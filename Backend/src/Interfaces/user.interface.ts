import { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  userName: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  verificationToken: string;
  verificationExpires: Date;
  resetCode: string;
  resetCodeExpires: Date;
  resetToken: String;
  resetTokenExpires: Date;
  bio: string;
  profilePic: string;
}
