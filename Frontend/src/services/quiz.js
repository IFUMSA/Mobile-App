import api from './api';

/**
 * Quiz Service - handles all quiz API calls
 */

// Get all quizzes
export const getQuizzes = async (category) => {
  const params = category ? { category } : {};
  const response = await api.get('/api/quiz', { params });
  return response.data;
};

// Get quiz categories
export const getCategories = async () => {
  const response = await api.get('/api/quiz/categories');
  return response.data;
};

// Get quiz by ID
export const getQuizById = async (id) => {
  const response = await api.get(`/api/quiz/${id}`);
  return response.data;
};

// Submit quiz answers
export const submitQuiz = async ({ quizId, answers, timeSpent }) => {
  const response = await api.post('/api/quiz/submit', {
    quizId,
    answers,
    timeSpent,
  });
  return response.data;
};

// Get user's quiz history
export const getQuizHistory = async () => {
  const response = await api.get('/api/quiz/history');
  return response.data;
};

export default {
  getQuizzes,
  getCategories,
  getQuizById,
  submitQuiz,
  getQuizHistory,
};
