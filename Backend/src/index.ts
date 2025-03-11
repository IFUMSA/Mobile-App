import express, { Express, Request, Response } from "express";
const { json } = require("express");
import session, { Session } from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import config from "./config";
import MongoStore from "connect-mongo"
import { connectDB } from "./connectDB";
import authRouter from "./Routes/auth";

//Initialize Express
const app: Express = express();

//Initialize dotenv
dotenv.config();

app.use( session({
  // store: redisStore,
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URL,
    ttl: 14* 24 * 60 * 60 * 1000 //Session expires in 14 days (in Seconds)
  }), 
  cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3,
  }
}))

app.use(cors());
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
// app.use("/api/user", userRouter)
app.use("/api/auth", authRouter);

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
