import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import config from '../config';

// Determine which email provider to use
// Use Resend if API key is set and valid, otherwise use Gmail SMTP
const useResend = config.RESEND_API_KEY && !config.RESEND_API_KEY.includes('your_api_key');

// Initialize Resend (if using)
const resend = useResend ? new Resend(config.RESEND_API_KEY) : null;

// Initialize Nodemailer transporter for Gmail SMTP
const nodemailerTransporter = nodemailer.createTransport({
    host: config.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(config.EMAIL_PORT || '587'),
    secure: config.EMAIL_SECURE === 'true',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
    },
});

// Default sender
const DEFAULT_FROM_RESEND = config.EMAIL_FROM || 'IFUMSA <onboarding@resend.dev>';
const DEFAULT_FROM_SMTP = config.EMAIL_FROM || `IFUMSA <${config.EMAIL_USER}>`;

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Send an email using Resend API
 */
const sendWithResend = async ({ to, subject, html }: EmailOptions): Promise<boolean> => {
    if (!resend) return false;

    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_RESEND,
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return false;
        }

        console.log('Email sent via Resend:', data?.id);
        return true;
    } catch (error) {
        console.error('Resend sending failed:', error);
        return false;
    }
};

/**
 * Send an email using Nodemailer (Gmail SMTP)
 */
const sendWithNodemailer = async ({ to, subject, html }: EmailOptions): Promise<boolean> => {
    try {
        const info = await nodemailerTransporter.sendMail({
            from: DEFAULT_FROM_SMTP,
            to,
            subject,
            html,
        });

        console.log('Email sent via Gmail SMTP:', info.messageId);
        return true;
    } catch (error) {
        console.error('Nodemailer sending failed:', error);
        return false;
    }
};

/**
 * Send an email using the configured provider
 * Uses Resend if configured, otherwise falls back to Gmail SMTP
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    if (useResend) {
        console.log('Using Resend for email delivery');
        return sendWithResend(options);
    } else {
        console.log('Using Gmail SMTP for email delivery');
        return sendWithNodemailer(options);
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
