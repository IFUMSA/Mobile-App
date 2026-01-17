import { Resend } from 'resend';
import config from '../config';

// Initialize Resend with API key
const resend = new Resend(config.RESEND_API_KEY);

// Default sender - use your verified domain or Resend's test domain
const DEFAULT_FROM = config.EMAIL_FROM || 'IFUMSA <onboarding@resend.dev>';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Send an email using Resend API
 * Works on all hosting providers (no SMTP port blocking issues)
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<boolean> => {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM,
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return false;
        }

        console.log('Email sent successfully:', data?.id);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

/**
 * Send verification email to new user
 */
export const sendVerificationEmail = async (
    to: string,
    firstName: string,
    verificationURL: string
): Promise<boolean> => {
    return sendEmail({
        to,
        subject: 'Verify Your Email - IFUMSA',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2A996B;">Email Verification</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering! Please verify your email by clicking the button below:</p>
        <a href="${verificationURL}" style="display: inline-block; padding: 12px 24px; background-color: #2A996B; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p style="color: #666;">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
    });
};

/**
 * Send password reset code email
 */
export const sendPasswordResetEmail = async (
    to: string,
    resetCode: string
): Promise<boolean> => {
    return sendEmail({
        to,
        subject: 'Password Reset Code - IFUMSA',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2A996B;">Password Reset</h1>
        <p>You requested a password reset for your account.</p>
        <p>Your verification code is:</p>
        <h2 style="background-color: #f0f0f0; padding: 16px; text-align: center; letter-spacing: 8px; font-size: 32px; border-radius: 8px;">${resetCode}</h2>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #666;">If you didn't request this reset, please ignore this email.</p>
      </div>
    `,
    });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
