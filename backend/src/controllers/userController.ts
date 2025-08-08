import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { IApiResponse, IAuthRequest, UserRole } from "../types";

// Get all users
export const getAllUsers = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;
    const sortBy = (req.query.sort as string) || "-createdAt";

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -refreshTokens")
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };

    res.status(200).json(response);
  }
);

// Get user statistics
export const getUserStats = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // Count by role
    const adminUsers = await User.countDocuments({ role: UserRole.ADMIN });
    const salesAdminUsers = await User.countDocuments({
      role: UserRole.SALES_ADMIN,
    });
    const salesAssociateUsers = await User.countDocuments({
      role: UserRole.SALES_ASSOCIATE,
    });
    const creditStaffUsers = await User.countDocuments({
      role: UserRole.CREDIT_STAFF,
    });
    const cashierUsers = await User.countDocuments({ role: UserRole.CASHIER });
    const clientUsers = await User.countDocuments({ role: UserRole.CLIENT });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Users by provider
    const localUsers = await User.countDocuments({ provider: "local" });
    const googleUsers = await User.countDocuments({ provider: "google" });
    const facebookUsers = await User.countDocuments({ provider: "facebook" });

    // Monthly registration stats
    const monthlyStats = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const response: IApiResponse = {
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentRegistrations,
        roleDistribution: {
          admin: adminUsers,
          salesAdmin: salesAdminUsers,
          salesAssociate: salesAssociateUsers,
          creditStaff: creditStaffUsers,
          cashier: cashierUsers,
          client: clientUsers,
        },
        providerDistribution: {
          local: localUsers,
          google: googleUsers,
          facebook: facebookUsers,
        },
        monthlyStats,
      },
    };

    res.status(200).json(response);
  }
);

// Get user by ID
export const getUserById = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -refreshTokens");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const response: IApiResponse = {
      success: true,
      message: "User retrieved successfully",
      data: { user },
    };

    res.status(200).json(response);
  }
);

// Create new user
export const createUser = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
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

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
      isActive = true,
    } = req.body;

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
      role: role || UserRole.CLIENT,
      phone,
      address,
      isActive,
      isEmailVerified: true, // Admin-created users are pre-verified
    });

    // Remove sensitive data from response
    const userResponse = await User.findById(user._id).select(
      "-password -refreshTokens"
    );

    const response: IApiResponse = {
      success: true,
      message: "User created successfully",
      data: { user: userResponse },
    };

    res.status(201).json(response);
  }
);

// Update user
export const updateUser = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
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

    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if email is being updated and if it already exists
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return next(new AppError("User already exists with this email", 400));
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.refreshTokens;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.provider;
    delete updates.providerId;
    delete updates.providerData;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refreshTokens");

    const response: IApiResponse = {
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    };

    res.status(200).json(response);
  }
);

// Delete user
export const deleteUser = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.userId === id) {
      return next(new AppError("You cannot delete your own account", 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if user has active leases or payments
    // This would require importing the models and checking
    // For now, we'll just delete the user
    await User.findByIdAndDelete(id);

    const response: IApiResponse = {
      success: true,
      message: "User deleted successfully",
    };

    res.status(200).json(response);
  }
);

// Activate user
export const activateUser = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.isActive) {
      return next(new AppError("User is already active", 400));
    }

    user.isActive = true;
    await user.save();

    const updatedUser = await User.findById(id).select(
      "-password -refreshTokens"
    );

    const response: IApiResponse = {
      success: true,
      message: "User activated successfully",
      data: { user: updatedUser },
    };

    res.status(200).json(response);
  }
);

// Deactivate user
export const deactivateUser = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (req.user?.userId === id) {
      return next(new AppError("You cannot deactivate your own account", 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!user.isActive) {
      return next(new AppError("User is already inactive", 400));
    }

    user.isActive = false;
    user.refreshTokens = []; // Clear all refresh tokens to force logout
    await user.save();

    const updatedUser = await User.findById(id).select(
      "-password -refreshTokens"
    );

    const response: IApiResponse = {
      success: true,
      message: "User deactivated successfully",
      data: { user: updatedUser },
    };

    res.status(200).json(response);
  }
);

// Reset user password
export const resetUserPassword = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return next(
        new AppError("New password must be at least 6 characters long", 400)
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Only allow password reset for local users
    if (user.provider !== "local") {
      return next(new AppError("Cannot reset password for OAuth users", 400));
    }

    user.password = newPassword;
    user.refreshTokens = []; // Clear all refresh tokens to force re-login
    await user.save();

    const response: IApiResponse = {
      success: true,
      message: "Password reset successfully. User must login again.",
    };

    res.status(200).json(response);
  }
);

// Get business summary for admin dashboard
export const getBusinessSummary = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    // Import models dynamically to avoid circular dependencies
    const LeaseAgreement = require("../models/LeaseAgreement").default;
    const Payment = require("../models/Payment").default;
    const Vehicle = require("../models/Vehicle").default;

    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const clientUsers = await User.countDocuments({ role: UserRole.CLIENT });

    // Vehicle stats
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({
      status: "available",
    });
    const leasedVehicles = await Vehicle.countDocuments({ status: "leased" });

    // Lease stats
    const totalLeases = await LeaseAgreement.countDocuments();
    const activeLeases = await LeaseAgreement.countDocuments({
      status: "active",
    });
    const pendingLeases = await LeaseAgreement.countDocuments({
      status: "pending",
    });

    // Payment stats
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({
      status: "completed",
    });

    // Revenue calculation
    const revenueData = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Monthly revenue for the last 12 months
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Overdue payments
    const today = new Date();
    const overduePayments = await Payment.countDocuments({
      status: "pending",
      dueDate: { $lt: today },
    });

    const response: IApiResponse = {
      success: true,
      message: "Business summary retrieved successfully",
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          clients: clientUsers,
        },
        vehicles: {
          total: totalVehicles,
          available: availableVehicles,
          leased: leasedVehicles,
        },
        leases: {
          total: totalLeases,
          active: activeLeases,
          pending: pendingLeases,
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          overdue: overduePayments,
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
        },
      },
    };

    res.status(200).json(response);
  }
);
