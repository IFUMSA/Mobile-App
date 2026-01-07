import { Request, Response } from "express";
import { Quiz, QuizAttempt, IQuiz } from "../Models/Quiz";

// Get all published quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const filter: { isPublished: boolean; category?: string } = { isPublished: true };
    if (category) filter.category = category as string;

    const quizzes = await Quiz.find(filter)
      .select("title description category duration questions")
      .lean();

    // Return quizzes with question count instead of full questions
    const quizzesWithCount = quizzes.map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      duration: quiz.duration,
      questionCount: quiz.questions?.length || 0,
    }));

    res.status(200).json({ quizzes: quizzesWithCount });
    return;
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get quiz by ID (for taking the quiz)
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id).lean();

    if (!quiz || !quiz.isPublished) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Return questions without correct answers for quiz taking
    const questionsForQuiz = quiz.questions.map((q, index) => ({
      id: index,
      question: q.question,
      options: q.options,
    }));

    res.status(200).json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        duration: quiz.duration,
        questions: questionsForQuiz,
      },
    });
    return;
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Submit quiz answers
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { quizId, answers, timeSpent } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!quizId || !answers || !Array.isArray(answers)) {
      res.status(400).json({ message: "Quiz ID and answers are required" });
      return;
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Calculate score
    let correctCount = 0;
    const results = quiz.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Save attempt
    const attempt = new QuizAttempt({
      userId,
      quizId,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      timeSpent: timeSpent || 0,
    });
    await attempt.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      result: {
        score,
        correctCount,
        totalQuestions: quiz.questions.length,
        results,
        attemptId: attempt._id,
      },
    });
    return;
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get user's quiz history
export const getQuizHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const attempts = await QuizAttempt.find({ userId })
      .populate("quizId", "title category")
      .sort({ completedAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({ attempts });
    return;
  } catch (error) {
    console.error("Get quiz history error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get quiz categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Quiz.distinct("category", { isPublished: true });
    res.status(200).json({ categories });
    return;
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Create quiz (admin only - for seeding)
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { title, description, category, questions, duration, isPublished } = req.body;

    if (!title || !category || !questions || !Array.isArray(questions)) {
      res.status(400).json({ message: "Title, category, and questions are required" });
      return;
    }

    const quiz = new Quiz({
      title,
      description,
      category,
      questions,
      duration: duration || 30,
      isPublished: isPublished || false,
      createdBy: req.session.userId,
    });

    await quiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        category: quiz.category,
      },
    });
    return;
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};
