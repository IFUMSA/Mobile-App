import { z } from 'zod';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// Reusable field schemas
const email = z.string().min(1, 'Email is required').email('Invalid email address');
const password = z
  .string()
  .min(1, 'Password is required')
  .regex(
    passwordRegex,
    'Password must be 8+ chars with uppercase, lowercase, number, and special character'
  );

// Signup schema
export const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    userName: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .trim(),
    email,
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Login schema
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email,
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// OTP schema
export const otpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});
