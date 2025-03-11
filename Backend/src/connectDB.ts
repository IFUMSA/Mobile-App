import mongoose from "mongoose";
import config from "./config";

// console.log(config.MONGODB_URL, config.PORT)

export const connectDB = async()=> {
  await  mongoose.connect(config.MONGODB_URL)
  console.log("DB connected successfully!")
}