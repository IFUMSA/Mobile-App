// import { sign } from "jsonwebtoken";
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

//Create A Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: parseInt(config.EMAIL_PORT || "587", 10),
  secure: config.EMAIL_SECURE === "true",
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

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
    const verificationURL = `${config.APP_URL}/verify-email?token=${verificationToken}`;

    //Send verification email
    await transporter.sendMail({
      from: `"IFUMSA Mobile APP" <${config.EMAIL_FROM}>`,
      to: email,
      subject: "Please Verify Your Email Address",
      html: `
  <h1>Email Verification</h1>
  <p>Hello ${firstName},</p>
  <p>Thank You For Registering, Please verify your email by clicking the link below: </p>
  <a href="${verificationURL}">Verify your email</a>
  <p>This link will expire in 24 hours</p>
  `,
    });

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
    const verificationURL = `${config.APP_URL}/verify-email?token=${verificationToken}`;

    //Send verification email
    await transporter.sendMail({
      from: `"IFUMSA Mobile APP" <${config.EMAIL_FROM}>`,
      to: email,
      subject: "Please Verify Your Email Address",
      html: `
  <h1>Email Verification</h1>
  <p>Hello ${user.firstName},</p>
  <p>Thank You For Registering, Please verify your email by clicking the link below: </p>
  <a href="${verificationURL}">Verify your email</a>
  <p>This link will expire in 24 hours</p>
  `,
    });
    res.status(200).json({ message: "Verification Email Sent Successfully" });
    return;

    //Catch Error
  } catch (error) {
    console.error("Resend Verification error: ", error);
    res.status(500).json({ message: "Failed To send verification email" });
    return;
  }
};
