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
import uploadRouter from "./Routes/upload";

//Initialize Express
const app: Express = express();

//Initialize dotenv
dotenv.config();

// Trust proxy for Railway/Render/etc (needed for secure cookies behind reverse proxy)
app.set('trust proxy', 1);

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URL,
    ttl: 14 * 24 * 60 * 60 // 14 days in SECONDS
  }),
  cookie: {
    secure: isProduction, // true in production (HTTPS), false in dev
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in ms
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin
  }
}))

// CORS configuration - allow credentials for admin panel and PWA
app.use(cors({
  origin: [
    "http://localhost:3000",  // Admin panel dev / PWA
    "http://localhost:3001",  // Alternative port
    "http://localhost:5173",  // Vite default
    "http://172.20.10.2:3000", // Network IP for mobile testing
    "https://ifumsa.app",     // Production PWA
    "https://www.ifumsa.app", // Production PWA with www
    "https://ifumsamobile.com", // Alternative production domain
    "https://www.ifumsamobile.com", // Alternative with www
    process.env.ADMIN_URL || "",
    process.env.PWA_URL || "",
  ].filter(Boolean), // Remove empty strings
  credentials: true,
}));

// Increase body size limit for base64 image uploads
app.use(json({ limit: '10mb' }));

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
app.use("/api/upload", uploadRouter);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`⚡️[server]: Server is running at http://0.0.0.0:${port}`);
});
