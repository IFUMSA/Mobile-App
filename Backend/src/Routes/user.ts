import express, { type Router } from "express";
import {
  getProfile,
  updateProfile,
  getUserById,
} from "../Controllers/userController";

const userRouter: Router = express.Router();

// Get current user profile
userRouter.get("/profile", getProfile);

// Update current user profile
userRouter.put("/profile", updateProfile);

// Get user by ID (public profile)
userRouter.get("/:id", getUserById);

export = userRouter;
