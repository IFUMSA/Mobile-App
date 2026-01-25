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
import { requireAuth } from "../Middlewares/requireAuth";

const studyRouter: Router = express.Router();

// Save generated quiz
studyRouter.post("/quizzes", requireAuth, saveGeneratedQuiz);

// Get user's quizzes
studyRouter.get("/quizzes", requireAuth, getUserQuizzes);

// Get quiz by ID
studyRouter.get("/quizzes/:id", requireAuth, getUserQuizById);

// Update quiz
studyRouter.put("/quizzes/:id", requireAuth, updateUserQuiz);

// Delete quiz
studyRouter.delete("/quizzes/:id", requireAuth, deleteUserQuiz);

// === Sharing Routes ===

// Get shared quiz by share code (PUBLIC - no auth required)
studyRouter.get("/shared/:shareCode", getQuizByShareCode);

// Toggle quiz sharing (owner only)
studyRouter.post("/quizzes/:id/share", requireAuth, toggleQuizSharing);

// Save a shared quiz to user's collection
studyRouter.post("/save-shared", requireAuth, saveSharedQuiz);

export = studyRouter;
