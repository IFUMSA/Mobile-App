import express, { type Router } from "express";
import { generateQuestions, getRateLimitStatus } from "../Controllers/aiController";

const aiRouter: Router = express.Router();

// Generate AI questions (rate limited)
aiRouter.post("/generate-questions", generateQuestions);

// Get rate limit status
aiRouter.get("/rate-limit-status", getRateLimitStatus);

export = aiRouter;
