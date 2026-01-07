import api from './api';

/**
 * Study Service - handles all study/quiz generation API calls
 */

// Save generated quiz
export const saveGeneratedQuiz = async ({ title, questions, questionType, duration }) => {
  const response = await api.post('/api/study/quizzes', {
    title,
    questions,
    questionType,
    duration,
  });
  return response.data;
};

// Get user's quizzes
export const getUserQuizzes = async () => {
  const response = await api.get('/api/study/quizzes');
  return response.data;
};

// Get quiz by ID
export const getUserQuizById = async (id) => {
  const response = await api.get(`/api/study/quizzes/${id}`);
  return response.data;
};

// Update quiz
export const updateUserQuiz = async ({ id, title, questions }) => {
  const response = await api.put(`/api/study/quizzes/${id}`, {
    title,
    questions,
  });
  return response.data;
};

// Delete quiz
export const deleteUserQuiz = async (id) => {
  const response = await api.delete(`/api/study/quizzes/${id}`);
  return response.data;
};

export default {
  saveGeneratedQuiz,
  getUserQuizzes,
  getUserQuizById,
  updateUserQuiz,
  deleteUserQuiz,
};
