import { z } from "zod";

// Login validation schema - matches mobile app
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

// Signup validation schema - matches mobile app
export const signupSchema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        userName: z
            .string()
            .min(1, "Username is required")
            .min(3, "Username must be at least 3 characters"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email"),
        password: z
            .string()
            .min(1, "Password is required")
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
