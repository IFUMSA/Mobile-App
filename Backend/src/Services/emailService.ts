import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';
import config from '../config';

// Initialize Resend client
const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

// Initialize SendGrid client
if (config.SENDGRID_API_KEY) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
}

// Default sender - use your verified domain
const DEFAULT_FROM = config.EMAIL_FROM || 'noreply@yourdomain.com';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Send an email with fallback support
 * Tries Resend first, falls back to SendGrid if Resend fails or isn't configured
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<boolean> => {
    // Try Resend first if configured
    if (resend && config.RESEND_API_KEY) {
        try {
            const { data, error } = await resend.emails.send({
                from: DEFAULT_FROM,
                to,
                subject,
                html,
            });

            if (error) {
                console.warn('⚠️ Resend failed, falling back to SendGrid:', error);
            } else {
                console.log('✓ Email sent via Resend to:', to, 'ID:', data?.id);
                return true;
            }
        } catch (error: any) {
            console.warn('⚠️ Resend error, falling back to SendGrid:', error.message);
        }
    }

    // Fallback to SendGrid
    if (config.SENDGRID_API_KEY) {
        try {
            await sgMail.send({
                to,
                from: DEFAULT_FROM,
                subject,
                html,
            });

            console.log('✓ Email sent via SendGrid (fallback) to:', to);
            return true;
        } catch (error: any) {
            console.error('❌ SendGrid error:', error?.response?.body || error);
            return false;
        }
    }

    console.error('❌ No email provider configured (checked RESEND_API_KEY and SENDGRID_API_KEY)');
    return false;
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

/**
 * Send admin credentials email
 */
export const sendAdminCredentialsEmail = async (
    to: string,
    password: string,
    firstName: string
): Promise<boolean> => {
    return sendEmail({
        to,
        subject: 'Your Admin Credentials - IFUMSA',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2A996B;">Welcome to IFUMSA Admin Panel</h1>
        <p>Hello ${firstName},</p>
        <p>You have been added as an administrator. Here are your login credentials:</p>
        <div style="background-color: #f0f0f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Password:</strong> <code style="background-color: #fff; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
        </div>
        <p>Please keep these credentials secure and change your password after your first login.</p>
        <a href="${config.ADMIN_URL || 'https://ifumsaadmin.vercel.app'}/login" style="display: inline-block; padding: 12px 24px; background-color: #2A996B; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Login to Admin Panel</a>
      </div>
    `,
    });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendAdminCredentialsEmail };
