import { Request, Response } from "express";
import { User } from "../Models/User";
import { IUser } from "../Interfaces/user.interface";

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("-password -verificationToken -verificationExpires -resetCode -resetCodeExpires -resetToken -resetTokenExpires");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
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
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const { firstName, lastName, userName, bio, profilePic } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if username is taken by another user
    if (userName) {
      const existingUser = await User.findOne({ userName, _id: { $ne: userId } });
      if (existingUser) {
        res.status(409).json({ message: "Username is already taken" });
        return;
      }
    }

    const updateData: Partial<IUser> = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (userName) updateData.userName = userName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePic) updateData.profilePic = profilePic;
    if (req.body.hasCompletedOnboarding !== undefined) {
      updateData.hasCompletedOnboarding = req.body.hasCompletedOnboarding;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password -verificationToken -verificationExpires -resetCode -resetCodeExpires -resetToken -resetTokenExpires");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
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
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};

// Get user by ID (public profile)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("userName firstName lastName profilePic bio");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
        bio: user.bio,
      },
    });
    return;
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error, try again" });
    return;
  }
};
