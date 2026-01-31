import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { User } from "../Models/User";
import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config";
import { IUser } from "../Interfaces/user.interface";
import { sendVerificationEmail, sendPasswordResetEmail } from "../Services/emailService";

const salt = 10;

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || "fallback-secret", {
    expiresIn: "7d",
  });
};

// Helper function to generate verification token
const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate a random 6-digit code
const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//Create New User
export const createUser = async (req: Request, res: Response) => {
  const { email, password, userName, firstName, lastName } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Check If User already exist and return appropriate error.
  const checkUserExist: IUser | null = await User.findOne({ email: email });

  if (checkUserExist) {
    res
      .status(409)
      .json({ statusCode: 409, message: "This Email Already exists" });
    return;
  }

  const checkUserNameAvailable: IUser | null = await User.findOne({
    userName: userName,
  });
  if (checkUserNameAvailable) {
    res.status(409).json({
      statusCode: 409,
      message: "This Username is no longer Available",
    });
    return;
  }

  //Create Verification Token and Token expiry
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours

  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log(hashedPassword);
    const newUser = new User({
      email,
      password: hashedPassword,
      userName,
      firstName,
      lastName,
      isVerified: false,
      verificationToken,
      verificationExpires,
    });
    await newUser.save();

    // Create Verification URL and send email
    const verificationURL = `${config.APP_URL}/api/auth/verify-email?token=${verificationToken}`;
    const emailSent = await sendVerificationEmail(email, firstName, verificationURL);

    if (!emailSent) {
      // Email failed to send - delete the user and return error
      console.error("Failed to send verification email to:", email);
      await User.deleteOne({ _id: newUser._id });
      res.status(500).json({
        message: "Registration failed: Unable to send verification email. Please try again.",
      });
      return;
    }

    console.log("Verification email sent to:", email);
    res.status(201).json({
      status: 201,
      message: "User Registered Successfully. Please check your email to verify your account.",
    });
    console.log("User Created Successfully!");
    return;
  } catch (error) {
    //Catch The Error and Log it
    console.error(error);
    res.status(500).json({
      message: "Registration Failed, Please Try Again",
      errorMessage: error,
    });
    return;
  }
};

//Verify New User
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({
        message: "Verification Token Is Required",
      });
      return;
    }

    //Find User with the verification token
    const user = await User.findOne({
      verificationToken: token as string,
      verificationExpires: { $gt: new Date() }, //Date Not Expired
    });

    //If there is no user, then the token is either not existent or is expired
    if (!user) {
      res.status(400).json({
        message:
          "Invalid or expired Verification token, please request a new one",
      });
      return;
    }

    //If user has been verified before in the past
    if (user.isVerified === true) {
      res
        .status(400)
        .json({
          message:
            "User has been verified in the past and is only clicking on the link again",
        });
      return;
    }

    //Update User as Verified if checks are passed
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    // FOR DEVELOPMENT BUILDS: Uncomment this line to use deep linking
    // res.redirect(`ifumsa://verification-success`);

    // FOR EXPO GO TESTING: Show a success HTML page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified - IFUMSA</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #1F382E 0%, #2A996B 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .container {
              background: rgba(255,255,255,0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
              max-width: 400px;
            }
            .checkmark {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 { margin: 0 0 16px 0; font-size: 24px; }
            p { margin: 0; opacity: 0.9; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Email Verified!</h1>
            <p>Your email has been successfully verified. You can now close this page and log in to the IFUMSA app.</p>
          </div>
        </body>
      </html>
    `);
    return;
  } catch (error) {
    console.error("Verification error: ", error);
    res.status(500).json({ message: "Verification Failed, Please Try Again" });
    return;
  }
};

//Route To Resend Verification Email
export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(401).json({ message: "Please povide a valid email address" });
      return;
    }

    const user = await User.findOne({ email });
    //If User does not exist
    if (!user) {
      res.status(404).json({ message: "User Not Found" });
      return;
    }

    //If User has been verified
    if (user.isVerified) {
      res.status(400).json({
        message: "Email has been verified",
      });
      return;
    }

    //Generate new Verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Create Verification URL and send email
    const verificationURL = `${config.APP_URL || ''}/api/auth/verify-email?token=${verificationToken}`;
    const emailSent = await sendVerificationEmail(email, String(user.firstName || ''), verificationURL);

    if (!emailSent) {
      throw new Error("Failed to send email");
    }
    console.log("Verification email resent to:", email);
    res.status(200).json({ message: "Verification Email Sent Successfully" });
    return;

    //Catch Error
  } catch (error) {
    console.error("Resend Verification error: ", error);
    res.status(500).json({ message: "Failed To send verification email" });
    return;
  }
};

//Login To Your Account
export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    //Check If none of the fields are empty
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    //Fetch user based on the data provided by user
    const user: IUser | null = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid Credentials" });
      return;
    }

    //Confirm if the user is verified
    if (!user.isVerified) {
      res.status(403).json({
        message:
          "Email Not Verified. Please Verify your email before logging in",
        needsVerification: true,
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Also set session for backward compatibility
    req.session.userId = user._id.toString();
    req.session.isAuthenticated = true;

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
        bio: user.bio,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
    return;
  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

//Route to Forgot Password?
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset code",
      });
      return;
    }

    // Generate 6-digit code and set expiration (15 minutes)
    const resetCode = generateResetCode();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with reset code information
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send email with reset code
    const emailSent = await sendPasswordResetEmail(email, resetCode);

    if (!emailSent) {
      console.error("Failed to send password reset email to:", email);
    } else {
      console.log("Password reset code sent to:", email);
    }

    res.status(200).json({
      message:
        "If your email is registered, you will receive a password reset code",
    });
    return;
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

//Route to verify Reset code
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ message: "Email and code are required" });
      return;
    }

    // Find user and verify code
    const user = await User.findOne({
      email,
      resetCode: code,
      resetCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired code" });
      return;
    }

    // Generate a temporary token for the actual password reset
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 more minutes
    await user.save();

    // Return the token to be used for the actual password reset
    res.status(200).json({
      message: "Code verified successfully",
      resetToken,
    });
    return;
  } catch (error) {
    console.error("Code verification error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

//Route to Reset Password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      res
        .status(400)
        .json({ message: "Reset token and new password are required" });
      return;
    }

    // Validate password length (same as signup)
    if (newPassword.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }

    // Find user with token
    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    // Update password and clear reset fields
    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
    return;
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};
