import { Document } from "mongoose"

export interface IUser extends Document {
    email: string,
    password: string,
    userName: string,
    firstName: string,
    lastName: string,
    isVerified: boolean,
    verificationToken: string,
    verificationExpires: Date,
    bio: string,
    profilePic: string,
  }