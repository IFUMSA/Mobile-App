import express, { Express, Request, Response } from "express";
const { json } = require("express");
import session, { Session } from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import config from "./config";
import MongoStore from "connect-mongo"
import { connectDB } from "./connectDB";
import authRouter from "./Routes/auth";
import userRouter from "./Routes/user";
import quizRouter from "./Routes/quiz";
import productRouter from "./Routes/product";
import cartRouter from "./Routes/cart";
import studyRouter from "./Routes/study";
import fileRouter from "./Routes/file";
import paymentRouter from "./Routes/payment";
import cardRouter from "./Routes/card";
import aiRouter from "./Routes/ai";
import adminRouter from "./Routes/admin";
import contentRouter from "./Routes/content";

//Initialize Express
const app: Express = express();

//Initialize dotenv
dotenv.config();

app.use(session({
  // store: redisStore,
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URL,
    ttl: 14 * 24 * 60 * 60 * 1000 //Session expires in 14 days (in Seconds)
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 3,
  }
}))

// CORS configuration - allow credentials for admin panel
app.use(cors({
  origin: [
    "http://localhost:3000",  // Admin panel dev
    "http://localhost:3001",  // Alternative port
    process.env.ADMIN_URL || "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(json({ extended: false }));

console.log(config.PORT)
const port = config.PORT || 8080;
// const port = 8888;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

//Connect to Database
connectDB();

//All Routes go here
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/study", studyRouter);
app.use("/api/file", fileRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/cards", cardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/admin", adminRouter);
app.use("/api/content", contentRouter);

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
