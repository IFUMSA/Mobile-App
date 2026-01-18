import sgMail from '@sendgrid/mail';
import config from '../config';

// Initialize SendGrid with API key
if (config.SENDGRID_API_KEY) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
}

// Default sender - use the email you verified in SendGrid
const DEFAULT_FROM = config.EMAIL_FROM || config.EMAIL_USER || 'noreply@example.com';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Send an email using SendGrid API
 * Works on all hosting providers (uses HTTPS, not SMTP)
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<boolean> => {
    if (!config.SENDGRID_API_KEY) {
        console.error('SendGrid API key not configured');
        return false;
    }

    try {
        await sgMail.send({
            to,
            from: DEFAULT_FROM,
            subject,
            html,
        });

        console.log('Email sent successfully via SendGrid to:', to);
        return true;
    } catch (error: any) {
        console.error('SendGrid error:', error?.response?.body || error);
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
