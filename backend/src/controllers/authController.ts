import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { generateTokenPair } from "../utils/jwt";
import { IApiResponse, IAuthRequest } from "../types";

// Register user
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new AppError(
          errors
            .array()
            .map((err) => err.msg)
            .join(", "),
          400
        )
      );
    }

    const { firstName, lastName, email, password, role, phone, address } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User already exists with this email", 400));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
    });

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token to user
    user.refreshTokens.push(tokenPair.refreshToken);
    await user.save();

    const response: IApiResponse = {
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
        },
        tokens: tokenPair,
      },
    };

    res.status(201).json(response);
  }
);

// Login user
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new AppError(
          errors
            .array()
            .map((err) => err.msg)
            .join(", "),
          400
        )
      );
    }

    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(
        new AppError(
          "Account is deactivated. Please contact administrator.",
          401
        )
      );
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Generate tokens
    const tokenPair = generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token to user
    user.refreshTokens.push(tokenPair.refreshToken);
    user.lastLogin = new Date();
    await user.save();

    const response: IApiResponse = {
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
        },
        tokens: tokenPair,
      },
    };

    res.status(200).json(response);
  }
);

// Refresh token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const oldRefreshToken = (req as any).refreshToken;

    // Generate new tokens
    const tokenPair = generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Replace old refresh token with new one
    const tokenIndex = user.refreshTokens.indexOf(oldRefreshToken);
    if (tokenIndex > -1) {
      user.refreshTokens[tokenIndex] = tokenPair.refreshToken;
    } else {
      user.refreshTokens.push(tokenPair.refreshToken);
    }

    await user.save();

    const response: IApiResponse = {
      success: true,
      message: "Token refreshed successfully",
      data: {
        tokens: tokenPair,
      },
    };

    res.status(200).json(response);
  }
);

// Logout user
export const logout = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    // Find user and remove refresh token
    const user = await User.findById(req.user.userId);
    if (user && refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }

    const response: IApiResponse = {
      success: true,
      message: "Logout successful",
    };

    res.status(200).json(response);
  }
);

// Logout from all devices
export const logoutAll = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    // Find user and clear all refresh tokens
    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }

    const response: IApiResponse = {
      success: true,
      message: "Logged out from all devices successfully",
    };

    res.status(200).json(response);
  }
);

// Get current user profile
export const getProfile = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const response: IApiResponse = {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    };

    res.status(200).json(response);
  }
);

// Update profile
export const updateProfile = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new AppError(
          errors
            .array()
            .map((err) => err.msg)
            .join(", "),
          400
        )
      );
    }

    const { firstName, lastName, phone, address, profileImage } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const response: IApiResponse = {
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage,
          updatedAt: user.updatedAt,
        },
      },
    };

    res.status(200).json(response);
  }
);

// Change password
export const changePassword = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new AppError(
          errors
            .array()
            .map((err) => err.msg)
            .join(", "),
          400
        )
      );
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check current password
    const isCurrentPasswordCorrect = await user.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordCorrect) {
      return next(new AppError("Current password is incorrect", 400));
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Clear all refresh tokens to force re-login
    await user.save();

    const response: IApiResponse = {
      success: true,
      message: "Password changed successfully. Please login again.",
    };

    res.status(200).json(response);
  }
);
