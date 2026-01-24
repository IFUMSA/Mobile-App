import { Request, Response } from "express";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { RateLimit } from "../Models/RateLimit";
import { User } from "../Models/User";
import config from "../config";
// pdf-parse v2 exports PDFParse class
const { PDFParse } = require("pdf-parse");
import mammoth from "mammoth";

// Rate limit configuration
const DAILY_GENERATION_LIMIT = 20;
const RATE_LIMIT_ACTION = "generate_questions";

// Initialize Anthropic client
const anthropic = createAnthropic({
    apiKey: config.ANTHROPIC_API_KEY,
});

/**
 * Extract text content from various document types
 */
async function extractTextFromDocument(base64Data: string, mimeType: string): Promise<string> {
    const buffer = Buffer.from(base64Data, 'base64');

    try {
        if (mimeType === 'application/pdf') {
            // PDF extraction using PDFParse v2 class
            // v2 requires { data: Uint8Array } in constructor
            const uint8Array = new Uint8Array(buffer);
            const parser = new PDFParse({ data: uint8Array });
            const result = await parser.getText();
            return result?.text || '';
        } else if (mimeType === 'application/msword' ||
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Word document extraction
            const result = await mammoth.extractRawText({ buffer });
            return result.value || '';
        } else if (mimeType === 'text/plain') {
            // Plain text - just decode
            return buffer.toString('utf-8');
        }
        return '';
    } catch (error) {
        console.error('Error extracting text from document:', error);
        return '';
    }
}

/**
 * Check if user is an admin based on their email
 */
function isAdminEmail(email: string): boolean {
    const adminEmails = process.env.ADMIN_EMAILS || "";
    const adminList = adminEmails.split(",").map((e) => e.trim().toLowerCase());
    return adminList.includes(email.toLowerCase());
}

/**
 * Check and update rate limit for a user action
 * Returns { allowed: boolean, remaining: number, resetAt: Date }
 */
async function checkRateLimit(userId: string, action: string, limit: number) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Find or create rate limit record
    let rateLimit = await RateLimit.findOne({ userId, action });

    if (!rateLimit) {
        // First time user - create new record
        rateLimit = new RateLimit({
            userId,
            action,
            count: 0,
            windowStart: startOfDay,
            lastUsed: now,
        });
    }

    // Check if we need to reset the window (new day)
    if (rateLimit.windowStart < startOfDay) {
        rateLimit.count = 0;
        rateLimit.windowStart = startOfDay;
    }

    // Calculate reset time (next midnight UTC)
    const resetAt = new Date(startOfDay);
    resetAt.setUTCDate(resetAt.getUTCDate() + 1);

    const remaining = Math.max(0, limit - rateLimit.count);
    const allowed = rateLimit.count < limit;

    return { allowed, remaining, resetAt, rateLimit };
}

/**
 * Generate questions using AI
 */
export const generateQuestions = async (req: Request, res: Response) => {
    console.log("=== GENERATE QUESTIONS REQUEST RECEIVED ===");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    try {
        const userId = req.session.userId;
        console.log("User ID:", userId);

        if (!userId) {
            console.log("ERROR: No userId in session");
            res.status(401).json({
                success: false,
                error: "Please log in to generate questions",
            });
            return;
        }

        // Get user to check if admin
        const user = await User.findById(userId);
        const userEmail = String(user?.email || "");
        const isAdmin = isAdminEmail(userEmail);

        // Check rate limit (skip for admins)
        let rateLimitRecord: any = null;
        if (!isAdmin) {
            const { allowed, remaining, resetAt, rateLimit } = await checkRateLimit(
                userId as string,
                RATE_LIMIT_ACTION,
                DAILY_GENERATION_LIMIT
            );
            rateLimitRecord = rateLimit;

            if (!allowed) {
                res.status(429).json({
                    success: false,
                    error: `Daily limit reached. You can generate ${DAILY_GENERATION_LIMIT} quizzes per day.`,
                    resetAt: resetAt.toISOString(),
                    remaining: 0,
                });
                return;
            }
        }

        const { topic, questionType, numberOfQuestions, fileParts } = req.body;

        // Validate inputs
        if (!topic && (!fileParts || fileParts.length === 0)) {
            res.status(400).json({
                success: false,
                error: "Please provide a topic or upload study materials",
            });
            return;
        }

        // File upload limits
        const MAX_FILE_SIZE_MB = 5;
        const MAX_FILES = 1;

        if (fileParts && Array.isArray(fileParts)) {
            if (fileParts.length > MAX_FILES) {
                res.status(400).json({
                    success: false,
                    error: `Maximum ${MAX_FILES} file(s) allowed per request`,
                });
                return;
            }

            for (const part of fileParts) {
                if (part.url && typeof part.url === "string") {
                    // Base64 data URL size check (rough estimate)
                    const sizeInBytes = (part.url.length * 3) / 4;
                    const sizeInMB = sizeInBytes / (1024 * 1024);

                    if (sizeInMB > MAX_FILE_SIZE_MB) {
                        res.status(400).json({
                            success: false,
                            error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`,
                        });
                        return;
                    }
                }
            }
        }

        const numQuestions = Math.min(
            Math.max(parseInt(numberOfQuestions) || 10, 1),
            50
        );
        const isMultipleChoice = questionType === "mcq";

        const questionTypeDesc = isMultipleChoice
            ? "multiple choice questions (MCQs) with exactly 4 options each"
            : 'true/false questions with exactly 2 options: ["True", "False"]';

        const optionsExample = isMultipleChoice
            ? '["Option A text", "Option B text", "Option C text", "Option D text"]'
            : '["True", "False"]';

        // Build context based on what's provided
        const hasDocument = fileParts && Array.isArray(fileParts) && fileParts.length > 0;
        const topicContext = topic
            ? `the topic "${topic}"`
            : hasDocument
                ? "the attached document/image"
                : "general medical knowledge";

        const documentInstruction = hasDocument
            ? `\n\nIMPORTANT: A document/file has been attached above. You MUST analyze this document thoroughly and generate questions based ONLY on its content. Extract key facts, concepts, and information from the document to create relevant questions.`
            : "";

        const prompt = `You are generating ${numQuestions} ${questionTypeDesc} for medical students studying ${topicContext}.${documentInstruction}

REQUIREMENTS:
1. Each question must be clear, unambiguous, and clinically relevant
2. Questions should test understanding, not just memorization
3. Include a mix of difficulty levels (easy, medium, hard)
4. Each explanation must clearly justify why the correct answer is right
5. correctAnswer is the 0-based index of the correct option

RESPOND WITH ONLY THIS JSON STRUCTURE (no markdown, no code blocks, just raw JSON):
{
  "questions": [
    {
      "question": "Clear, well-formatted question text here?",
      "options": ${optionsExample},
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong."
    }
  ]
}

Generate exactly ${numQuestions} questions now:`;

        console.log("=== CALLING ANTHROPIC API ===");
        console.log("Model: claude-haiku-4-5");
        console.log("Topic:", topic);
        console.log("Has file parts:", fileParts?.length > 0);

        // Build message content array for multimodal processing
        const messageContent: any[] = [];
        let extractedDocumentText = '';

        // Process file parts
        if (fileParts && Array.isArray(fileParts) && fileParts.length > 0) {
            for (const part of fileParts) {
                if (part.url && part.mediaType) {
                    // Handle base64 data URLs
                    if (part.url.startsWith('data:')) {
                        const isImage = part.mediaType.startsWith('image/');
                        const base64Data = part.url.split(',')[1];

                        if (isImage) {
                            // Images use 'image' type with the full data URL
                            messageContent.push({
                                type: 'image',
                                image: part.url,
                            });
                            console.log("Added image part:", part.mediaType);
                        } else if (base64Data) {
                            // Extract text from PDFs, Word docs, and text files
                            console.log("Extracting text from:", part.mediaType);
                            const text = await extractTextFromDocument(base64Data, part.mediaType);
                            if (text) {
                                extractedDocumentText += text + '\n\n';
                                console.log("Extracted text length:", text.length);
                            } else {
                                console.log("No text extracted from document");
                            }
                        }
                    }
                }
            }
        }

        // Build the final prompt with extracted document text
        let finalPrompt = prompt;
        if (extractedDocumentText) {
            finalPrompt = `DOCUMENT CONTENT:\n${extractedDocumentText.slice(0, 50000)}\n\n---\n\n${prompt}`;
            console.log("Added document text to prompt, total length:", finalPrompt.length);
        }

        // Add the text prompt
        messageContent.push({
            type: 'text',
            text: finalPrompt,
        });

        // Call AI via Anthropic with multimodal content
        const result = await generateText({
            model: anthropic('claude-haiku-4-5'),
            system: `You are Dr. Quiz, an expert medical education specialist for IFUMSA (Ife University Medical Students Association). You create high-quality, exam-style questions that help medical students prepare for their assessments.

Your questions are:
- Clinically accurate and up-to-date
- Written in clear, professional medical language
- Designed to test critical thinking, not just recall
- Accompanied by educational explanations

IMPORTANT: If a document/file is provided, analyze it thoroughly and generate questions based on its content. Focus on key concepts, important facts, and clinically relevant information from the document.

CRITICAL: Always respond with valid JSON only. Never use markdown code blocks. Never include text before or after the JSON.`,
            messages: [
                {
                    role: 'user',
                    content: messageContent,
                },
            ],
        });

        console.log("=== AI RESPONSE RECEIVED ===");
        console.log("Response length:", result.text?.length);
        console.log("First 500 chars:", result.text?.substring(0, 500));

        // Parse the response
        let questions;
        const text = result.text.trim();

        try {
            console.log("Attempting to parse JSON...");
            const parsed = JSON.parse(text);
            questions = parsed.questions;
            console.log("JSON parsed successfully, questions count:", questions?.length);
        } catch {
            // Try to extract JSON object from response
            const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    questions = parsed.questions;
                } catch {
                    console.error(
                        "Failed to parse extracted JSON:",
                        jsonMatch[0].substring(0, 200)
                    );
                    throw new Error("AI response format error");
                }
            } else {
                console.error("No JSON found in response:", text.substring(0, 200));
                throw new Error("AI did not return valid questions");
            }
        }

        // Validate questions structure
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("No questions generated");
        }

        // Validate and clean each question
        questions = questions.map((q: any, index: number) => ({
            question: q.question || `Question ${index + 1}`,
            options: Array.isArray(q.options)
                ? q.options
                : ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
            explanation: q.explanation || "No explanation provided.",
        }));

        // Increment rate limit counter for non-admin users
        if (rateLimitRecord) {
            rateLimitRecord.count += 1;
            rateLimitRecord.lastUsed = new Date();
            await rateLimitRecord.save();
        }

        console.log("=== SENDING SUCCESS RESPONSE ===");
        console.log("Questions count:", questions.length);

        res.json({
            success: true,
            questions,
            count: questions.length,
        });
        return;
    } catch (error: any) {
        console.error("=== GENERATE QUESTIONS ERROR ===");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);

        let message = "Failed to generate questions. Please try again.";

        if (error.message?.includes("API key") || error.message?.includes("401")) {
            message = "AI service not configured. Please contact support.";
        } else if (
            error.message?.includes("rate limit") ||
            error.message?.includes("429")
        ) {
            message = "AI service busy. Please wait a moment and try again.";
        } else if (
            error.message?.includes("format") ||
            error.message?.includes("parse")
        ) {
            message = "AI response error. Please try again with a different topic.";
        }

        res.status(500).json({ success: false, error: message });
        return;
    }
};

/**
 * Get user's current rate limit status
 */
export const getRateLimitStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }

        const { allowed, remaining, resetAt } = await checkRateLimit(
            userId as string,
            RATE_LIMIT_ACTION,
            DAILY_GENERATION_LIMIT
        );

        res.json({
            success: true,
            limit: DAILY_GENERATION_LIMIT,
            remaining,
            resetAt: resetAt.toISOString(),
            canGenerate: allowed,
        });
        return;
    } catch (error) {
        console.error("Get rate limit status error:", error);
        res.status(500).json({ success: false, error: "Server error" });
        return;
    }
};
