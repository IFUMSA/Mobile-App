import { Document } from "mongoose"

export interface IUser extends Document {
    email: string,
    password: string,
    userName: string,
    firstName: string,
    lastName: string,
    isVerified: boolean,
    bio: string,
    profilePic: string,
    accessToken: string,
    refreshToken?: string
  }