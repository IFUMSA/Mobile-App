import express, { type Router } from "express";
import {
  getProfile,
  updateProfile,
  getUserById,
} from "../Controllers/userController";
import { requireAuth } from "../Middlewares/requireAuth";

const userRouter: Router = express.Router();

// Get current user profile
userRouter.get("/profile", requireAuth, getProfile);

// Update current user profile
userRouter.put("/profile", requireAuth, updateProfile);

// Get user by ID (public profile)
userRouter.get("/:id", getUserById);

export = userRouter;
