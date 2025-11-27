import { useMutation } from '@tanstack/react-query';
import * as authService from '@services/auth';

/**
 * Auth mutations using React Query
 * These handle loading, error states automatically
 */

export const useSignupMutation = (options = {}) => {
  return useMutation({
    mutationFn: authService.signup,
    ...options,
  });
};

export const useSigninMutation = (options = {}) => {
  return useMutation({
    mutationFn: authService.signin,
    ...options,
  });
};

export const useForgotPasswordMutation = (options = {}) => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    ...options,
  });
};

export const useVerifyResetCodeMutation = (options = {}) => {
  return useMutation({
    mutationFn: authService.verifyResetCode,
    ...options,
  });
};

export const useResetPasswordMutation = (options = {}) => {
  return useMutation({
    mutationFn: authService.resetPassword,
    ...options,
  });
};

export const useResendVerificationMutation = (options = {}) => {
  return useMutation({
    mutationFn: authService.resendVerification,
    ...options,
  });
};
