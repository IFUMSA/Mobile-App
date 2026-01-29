import { Request, Response } from "express";
import { Quiz } from "../Models/Quiz";

// Save user-generated quiz
export const saveGeneratedQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { title, questions, questionType, duration } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: "Title and questions are required" });
      return;
    }

    const quiz = new Quiz({
      title,
      description: `Generated quiz on ${title}`,
      category: questionType === 'mcq' ? 'Multiple Choice' : 'True/False',
      questions,
      duration: parseInt(duration, 10) || 30,
      createdBy: userId,
      isPublished: false, // User-generated quizzes are private by default
    });

    await quiz.save();

    res.status(201).json({
      message: "Quiz saved successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        questionCount: quiz.questions.length,
      },
    });
    return;
  } catch (error) {
    console.error("Save quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get user's generated quizzes
export const getUserQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const quizzes = await Quiz.find({ createdBy: userId })
      .select("title category questions duration createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formattedQuizzes = quizzes.map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      questionCount: quiz.questions?.length || 0,
      type: quiz.category,
      duration: quiz.duration,
      createdAt: quiz.createdAt,
    }));

    res.status(200).json({ quizzes: formattedQuizzes });
    return;
  } catch (error) {
    console.error("Get user quizzes error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get user's quiz by ID (with full questions for practice/quiz mode)
export const getUserQuizById = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const quiz = await Quiz.findOne({ _id: id, createdBy: userId }).lean();

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.status(200).json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        category: quiz.category,
        duration: quiz.duration,
        questions: quiz.questions,
      },
    });
    return;
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Update user's quiz
export const updateUserQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { title, questions } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, createdBy: userId },
      {
        $set: {
          ...(title && { title }),
          ...(questions && { questions }),
        },
      },
      { new: true }
    );

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.status(200).json({
      message: "Quiz updated successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        questionCount: quiz.questions.length,
      },
    });
    return;
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Delete user's quiz
export const deleteUserQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const quiz = await Quiz.findOneAndDelete({ _id: id, createdBy: userId });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.status(200).json({ message: "Quiz deleted successfully" });
    return;
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Generate unique 8-character share code
function generateShareCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get quiz by share code (PUBLIC - no auth required)
export const getQuizByShareCode = async (req: Request, res: Response) => {
  try {
    const { shareCode } = req.params;

    if (!shareCode) {
      res.status(400).json({ message: "Share code is required" });
      return;
    }

    const quiz = await Quiz.findOne({ shareCode, isShared: true })
      .populate("createdBy", "userName firstName lastName")
      .lean();

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found or no longer shared" });
      return;
    }

    res.status(200).json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        duration: quiz.duration,
        questionCount: quiz.questions?.length || 0,
        questions: quiz.questions,
        createdBy: quiz.createdBy,
        shareCode: quiz.shareCode,
      },
    });
    return;
  } catch (error) {
    console.error("Get shared quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Enable quiz sharing (owner only) - always enables, never toggles off
export const toggleQuizSharing = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const quiz = await Quiz.findOne({ _id: id, createdBy: userId });

    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Always enable sharing (don't toggle off)
    if (!quiz.isShared) {
      // Generate share code if needed
      if (!quiz.shareCode) {
        let code = generateShareCode();
        // Ensure uniqueness
        while (await Quiz.findOne({ shareCode: code })) {
          code = generateShareCode();
        }
        quiz.shareCode = code;
      }
      quiz.isShared = true;
      quiz.sharedAt = new Date();
      await quiz.save();
    }

    res.status(200).json({
      message: "Quiz is now shared",
      isShared: true,
      shareCode: quiz.shareCode,
      shareLink: `ifumsa://quiz/${quiz.shareCode}`,
    });
    return;
  } catch (error) {
    console.error("Enable sharing error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Save a shared quiz to user's collection
export const saveSharedQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { shareCode } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Please log in to save quizzes" });
      return;
    }

    if (!shareCode) {
      res.status(400).json({ message: "Share code is required" });
      return;
    }

    // Find the shared quiz
    const originalQuiz = await Quiz.findOne({ shareCode, isShared: true });

    if (!originalQuiz) {
      res.status(404).json({ message: "Quiz not found or no longer shared" });
      return;
    }

    // Create a copy for the user
    const newQuiz = new Quiz({
      title: `${originalQuiz.title} (Saved)`,
      description: originalQuiz.description,
      category: originalQuiz.category,
      questions: originalQuiz.questions,
      duration: originalQuiz.duration,
      createdBy: userId,
      isPublished: false,
      isShared: false,
    });

    await newQuiz.save();

    res.status(201).json({
      message: "Quiz saved to your collection",
      quiz: {
        id: newQuiz._id,
        title: newQuiz.title,
        questionCount: newQuiz.questions.length,
      },
    });
    return;
  } catch (error) {
    console.error("Save shared quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};
