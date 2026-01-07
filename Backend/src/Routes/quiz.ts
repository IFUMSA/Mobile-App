import express, { type Router } from "express";
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizHistory,
  getCategories,
  createQuiz,
} from "../Controllers/quizController";

const quizRouter: Router = express.Router();

// Get all quiz categories
quizRouter.get("/categories", getCategories);

// Get all published quizzes
quizRouter.get("/", getQuizzes);

// Get user's quiz history
quizRouter.get("/history", getQuizHistory);

// Get quiz by ID
quizRouter.get("/:id", getQuizById);

// Submit quiz answers
quizRouter.post("/submit", submitQuiz);

// Create quiz (for admin/seeding)
quizRouter.post("/", createQuiz);

export = quizRouter;
