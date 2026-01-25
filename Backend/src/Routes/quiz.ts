import express, { type Router } from "express";
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizHistory,
  getCategories,
  createQuiz,
} from "../Controllers/quizController";
import { requireAuth } from "../Middlewares/requireAuth";

const quizRouter: Router = express.Router();

// Get all quiz categories (public)
quizRouter.get("/categories", getCategories);

// Get all published quizzes (public)
quizRouter.get("/", getQuizzes);

// Get user's quiz history
quizRouter.get("/history", requireAuth, getQuizHistory);

// Get quiz by ID (public)
quizRouter.get("/:id", getQuizById);

// Submit quiz answers
quizRouter.post("/submit", requireAuth, submitQuiz);

// Create quiz (for admin/seeding)
quizRouter.post("/", requireAuth, createQuiz);

export = quizRouter;
