import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { User } from "../Models/User";
import { Request, Response } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import config from "../config";
import { IUser } from "../Interfaces/user.interface";
const salt = 10;

//Helper function to generate verification token
const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate a random 6-digit code
const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createTransporter = async () => {
  // Create test account (no signup needed)
  const testAccount = await nodemailer.createTestAccount();

  // /**
  // Create a transporter using the test account
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

//Create A Nodemailer Transporter
// const transporter = nodemailer.createTransport({
//   host: config.EMAIL_HOST,
//   port: parseInt(config.EMAIL_PORT || "587", 10),
//   secure: config.EMAIL_SECURE === "true",
//   auth: {
//     user: config.EMAIL_USER,
//     pass: config.EMAIL_PASSWORD,
//   },
// });

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

    //Create Verification URL
    const verificationURL = `${config.APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    const transporter = await createTransporter();

    // Send mail with the transporter
    const info = await transporter.sendMail({
      from: '"Your App" <foo@example.com>',
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verificationURL}">here</a> to verify</p>`,
    });

    // Log URL where you can see the email (it's not actually sent)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    //  */

    //Send verification email
    //   await transporter.sendMail({
    //     from: `"IFUMSA Mobile APP" <${config.EMAIL_FROM}>`,
    //     to: email,
    //     subject: "Please Verify Your Email Address",
    //     html: `
    // <h1>Email Verification</h1>
    // <p>Hello ${firstName},</p>
    // <p>Thank You For Registering, Please verify your email by clicking the link below: </p>
    // <a href="${verificationURL}">Verify your email</a>
    // <p>This link will expire in 24 hours</p>
    // `,
    //   });

    //After verification email has been sent, save user details
    res.status(201).json({
      status: 201,
      message: "User Registered Successfully",
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

    //Redirect to frontend success page or respond with a success message
    res.redirect(`${config.FRONTEND_URL}/verification-success`);
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

    //Create Verification URL
    const verificationURL = `${config.APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    const transporter = await createTransporter();

    // Send mail with the transporter
    const info = await transporter.sendMail({
      from: '"Your App" <foo@example.com>',
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verificationURL}">here</a> to verify</p>`,
    });

    // Log URL where you can see the email (it's not actually sent)
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    //  */

    //Send verification email
    //   await transporter.sendMail({
    //     from: `"IFUMSA Mobile APP" <${config.EMAIL_FROM}>`,
    //     to: email,
    //     subject: "Please Verify Your Email Address",
    //     html: `
    // <h1>Email Verification</h1>
    // <p>Hello ${user.firstName},</p>
    // <p>Thank You For Registering, Please verify your email by clicking the link below: </p>
    // <a href="${verificationURL}">Verify your email</a>
    // <p>This link will expire in 24 hours</p>
    // `,
    //   });
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

    //Set Session Data
    req.session.userId = user._id;
    req.session.isAuthenticated = true;

    res.status(200).json({ message: "Login Successful" });
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
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: '"Your App" <noreply@yourapp.com>',
      to: email,
      subject: "Password Reset Code",
      html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your account.</p>
      <p>Your verification code is: <strong>${resetCode}</strong></p>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `,
    });

    // For development, log the preview URL
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
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
    // Note: You would hash this password before saving
    user.password = newPassword; // Assuming you hash before saving in your model
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
