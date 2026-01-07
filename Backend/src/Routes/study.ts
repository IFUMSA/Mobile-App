import express, { type Router } from "express";
import {
  saveGeneratedQuiz,
  getUserQuizzes,
  getUserQuizById,
  updateUserQuiz,
  deleteUserQuiz,
  getQuizByShareCode,
  toggleQuizSharing,
  saveSharedQuiz,
} from "../Controllers/studyController";

const studyRouter: Router = express.Router();

// Save generated quiz
studyRouter.post("/quizzes", saveGeneratedQuiz);

// Get user's quizzes
studyRouter.get("/quizzes", getUserQuizzes);

// Get quiz by ID
studyRouter.get("/quizzes/:id", getUserQuizById);

// Update quiz
studyRouter.put("/quizzes/:id", updateUserQuiz);

// Delete quiz
studyRouter.delete("/quizzes/:id", deleteUserQuiz);

// === Sharing Routes ===

// Get shared quiz by share code (PUBLIC - no auth required)
studyRouter.get("/shared/:shareCode", getQuizByShareCode);

// Toggle quiz sharing (owner only)
studyRouter.post("/quizzes/:id/share", toggleQuizSharing);

// Save a shared quiz to user's collection
studyRouter.post("/save-shared", saveSharedQuiz);

export = studyRouter;
