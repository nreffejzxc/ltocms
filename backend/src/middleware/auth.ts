import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AppError, asyncHandler } from "./errorHandler";
import { IJWTPayload, UserRole, IAuthRequest } from "../types";

// Protect routes - verify JWT token
export const protect = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJWTPayload;

      // Get user from token
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new AppError("No user found with this token", 401));
      }

      if (!user.isActive) {
        return next(new AppError("User account is deactivated", 401));
      }

      // Add user to request object
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      return next(new AppError("Not authorized to access this route", 401));
    }
  }
);

// Role-based access control
export const authorize = (...roles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

// Admin only access
export const adminOnly = authorize(UserRole.ADMIN);

// Sales access (Admin, Sales Admin, Sales Associate)
export const salesAccess = authorize(
  UserRole.ADMIN,
  UserRole.SALES_ADMIN,
  UserRole.SALES_ASSOCIATE
);

// Credit access (Admin, Credit Staff, Cashier)
export const creditAccess = authorize(
  UserRole.ADMIN,
  UserRole.CREDIT_STAFF,
  UserRole.CASHIER
);

// Client access (Admin, Client)
export const clientAccess = authorize(UserRole.ADMIN, UserRole.CLIENT);

// Staff access (All except Client)
export const staffAccess = authorize(
  UserRole.ADMIN,
  UserRole.SALES_ADMIN,
  UserRole.SALES_ASSOCIATE,
  UserRole.CREDIT_STAFF,
  UserRole.CASHIER,
  UserRole.DEVELOPER
);

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceUserField: string = "user") => {
  return asyncHandler(
    async (req: IAuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError("Not authorized to access this route", 401));
      }

      // Admin can access everything
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      // Get resource ID from params or body
      const resourceId = req.params.id || req.body.id;

      if (!resourceId) {
        return next(new AppError("Resource ID is required", 400));
      }

      // For client role, check if they own the resource
      if (req.user.role === UserRole.CLIENT) {
        // This would need to be customized based on the specific resource
        // For now, we'll check if the user ID matches
        if (
          req.user.userId !== resourceId &&
          req.body[resourceUserField] !== req.user.userId
        ) {
          return next(
            new AppError("Not authorized to access this resource", 403)
          );
        }
      }

      next();
    }
  );
};

// Refresh token validation
export const validateRefreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as IJWTPayload;

      // Get user and check if refresh token exists
      const user = await User.findById(decoded.userId);

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return next(new AppError("Invalid refresh token", 401));
      }

      if (!user.isActive) {
        return next(new AppError("User account is deactivated", 401));
      }

      // Add user to request
      (req as any).user = user;
      (req as any).refreshToken = refreshToken;

      next();
    } catch (error) {
      return next(new AppError("Invalid refresh token", 401));
    }
  }
);
