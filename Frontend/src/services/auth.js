import api from './api';

/**
 * Auth Service - handles all authentication API calls
 */

// Sign up a new user
export const signup = async ({ email, password, userName, firstName, lastName }) => {
  const response = await api.post('/api/auth/signup', {
    email,
    password,
    userName,
    firstName,
    lastName,
  });
  return response.data;
};

// Sign in user
export const signin = async ({ email, password }) => {
  const response = await api.post('/api/auth/signin', {
    email,
    password,
  });
  return response.data;
};

// Request password reset (sends code to email)
export const forgotPassword = async (email) => {
  const response = await api.post('/api/auth/forgot-password', { email });
  return response.data;
};

// Verify the OTP code sent to email
export const verifyResetCode = async ({ email, code }) => {
  const response = await api.post('/api/auth/verify-reset-code', {
    email,
    code,
  });
  return response.data;
};

// Reset password with token
export const resetPassword = async ({ resetToken, newPassword }) => {
  const response = await api.post('/api/auth/reset-password', {
    resetToken,
    newPassword,
  });
  return response.data;
};

// Resend verification email
export const resendVerification = async (email) => {
  const response = await api.post('/api/auth/resend-verification', { email });
  return response.data;
};

export default {
  signup,
  signin,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendVerification,
};
