import express, { type Router } from "express";
import { generateQuestions, getRateLimitStatus } from "../Controllers/aiController";
import { requireAuth } from "../Middlewares/requireAuth";

const aiRouter: Router = express.Router();

// Generate AI questions (rate limited)
aiRouter.post("/generate-questions", requireAuth, generateQuestions);

// Get rate limit status
aiRouter.get("/rate-limit-status", requireAuth, getRateLimitStatus);

export = aiRouter;
