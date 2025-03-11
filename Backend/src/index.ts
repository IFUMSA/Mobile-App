import express, { Express, Request, Response } from "express";
const { json } = require("express");
import cors from "cors";
import dotenv from "dotenv";
import config from "./config";
import { connectDB } from "./connectDB";

//Initialize Express
const app: Express = express();

//Initialize dotenv
dotenv.config();

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

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
