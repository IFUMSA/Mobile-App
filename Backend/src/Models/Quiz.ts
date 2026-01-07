import { model, Schema, Types } from "mongoose";

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IQuiz {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  questions: IQuestion[];
  duration: number; // in minutes
  createdBy?: Types.ObjectId;
  isPublished: boolean;
  shareCode?: string;     // Unique 8-char code for sharing
  isShared: boolean;      // Whether quiz is publicly accessible
  sharedAt?: Date;        // When sharing was enabled
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizAttempt {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  answers: number[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  timeSpent: number; // in seconds
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
});

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    questions: [QuestionSchema],
    duration: { type: Number, required: true, default: 30 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isPublished: { type: Boolean, default: false },
    shareCode: { type: String, unique: true, sparse: true },
    isShared: { type: Boolean, default: false },
    sharedAt: { type: Date },
  },
  { timestamps: true }
);

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    answers: [{ type: Number }],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>("Quiz", QuizSchema);
export const QuizAttempt = model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);
