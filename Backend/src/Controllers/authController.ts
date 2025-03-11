import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { User } from "../Models/User";
import { Request, Response } from "express";

import config from "../config";
import { IUser } from "../Interfaces/user.interface";
const salt = 10;


//Create New User
export const createUser = async (
    req: Request,
    res: Response
  ): Promise<Object> => {
    const { email, password, userName, firstName, lastName } = req.body;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    // Check If User already exist and return appropriate error.
    const checkUserExist: IUser|null = await User.findOne({email: email});
    
    if (checkUserExist) {
      return res
        .status(409)
        .json({ statusCode: 409, message: "This Email Already exists" });
    }
  
    const checkUserNameAvailable: IUser|null = await User.findOne({userName: userName})
    if (checkUserNameAvailable) {
      return res
        .status(409)
        .json({ statusCode: 409, message: "This Username is no longer Available" });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, salt);
      // console.log(hashedPassword);
      const newUser = new User({
        email,
        password: hashedPassword,
        userName,
        firstName,
        lastName,
        isVerified : false
      });
      await newUser.save();
      console.log("User Created Successfully!");
      return res.status(200).json({
        status: 200,
        message: "User Created Successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "An Error Occoured",
        errorMessage: error,
      });
    }
  };