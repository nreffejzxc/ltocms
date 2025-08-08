import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import LeaseAgreement from "../models/LeaseAgreement";
import Vehicle from "../models/Vehicle";
import User from "../models/User";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import {
  IApiResponse,
  IAuthRequest,
  LeaseStatus,
  VehicleStatus,
  UserRole,
} from "../types";

// Get all leases
export const getAllLeases = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const sortBy = (req.query.sort as string) || "-createdAt";

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { leaseNumber: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    if (status && Object.values(LeaseStatus).includes(status as LeaseStatus)) {
      query.status = status;
    }

    // Role-based filtering
    if (req.user?.role === UserRole.SALES_ASSOCIATE) {
      query.salesPerson = req.user.userId;
    }

    const total = await LeaseAgreement.countDocuments(query);
    const leases = await LeaseAgreement.find(query)
      .populate("client", "firstName lastName email phone")
      .populate("vehicle", "make vehicleModel year vin color")
      .populate("salesPerson", "firstName lastName")
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Leases retrieved successfully",
      data: {
        leases,
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

// Get current user's leases (for clients)
export const getMyLeases = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await LeaseAgreement.countDocuments({
      client: req.user.userId,
    });
    const leases = await LeaseAgreement.find({ client: req.user.userId })
      .populate("vehicle", "make vehicleModel year vin color images")
      .populate("salesPerson", "firstName lastName")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Your leases retrieved successfully",
      data: {
        leases,
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

// Get active leases
export const getActiveLeases = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const leases = await LeaseAgreement.find({ status: LeaseStatus.ACTIVE })
      .populate("client", "firstName lastName email phone")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("salesPerson", "firstName lastName")
      .sort("-startDate");

    const response: IApiResponse = {
      success: true,
      message: "Active leases retrieved successfully",
      data: { leases },
    };

    res.status(200).json(response);
  }
);

// Get overdue leases
export const getOverdueLeases = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const today = new Date();
    const leases = await LeaseAgreement.find({
      status: LeaseStatus.ACTIVE,
      endDate: { $lt: today },
    })
      .populate("client", "firstName lastName email phone")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("salesPerson", "firstName lastName")
      .sort("endDate");

    const response: IApiResponse = {
      success: true,
      message: "Overdue leases retrieved successfully",
      data: { leases },
    };

    res.status(200).json(response);
  }
);

// Get lease statistics
export const getLeaseStats = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const totalLeases = await LeaseAgreement.countDocuments();
    const activeLeases = await LeaseAgreement.countDocuments({
      status: LeaseStatus.ACTIVE,
    });
    const pendingLeases = await LeaseAgreement.countDocuments({
      status: LeaseStatus.PENDING,
    });
    const completedLeases = await LeaseAgreement.countDocuments({
      status: LeaseStatus.COMPLETED,
    });
    const defaultedLeases = await LeaseAgreement.countDocuments({
      status: LeaseStatus.DEFAULTED,
    });

    // Calculate total revenue from active leases
    const revenueData = await LeaseAgreement.aggregate([
      { $match: { status: LeaseStatus.ACTIVE } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Monthly lease creation stats
    const monthlyStats = await LeaseAgreement.aggregate([
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
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const response: IApiResponse = {
      success: true,
      message: "Lease statistics retrieved successfully",
      data: {
        totalLeases,
        activeLeases,
        pendingLeases,
        completedLeases,
        defaultedLeases,
        totalRevenue,
        monthlyStats,
      },
    };

    res.status(200).json(response);
  }
);

// Get lease by ID
export const getLeaseById = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const lease = await LeaseAgreement.findById(id)
      .populate("client", "firstName lastName email phone address")
      .populate("vehicle")
      .populate("salesPerson", "firstName lastName email");

    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    // Check if client can only access their own leases
    if (
      req.user?.role === UserRole.CLIENT &&
      lease.client.toString() !== req.user.userId
    ) {
      return next(new AppError("Not authorized to access this lease", 403));
    }

    const response: IApiResponse = {
      success: true,
      message: "Lease retrieved successfully",
      data: { lease },
    };

    res.status(200).json(response);
  }
);

// Create new lease
export const createLease = asyncHandler(
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
      client,
      vehicle,
      startDate,
      endDate,
      monthlyPayment,
      downPayment,
      totalAmount,
      interestRate,
      terms,
      notes,
    } = req.body;

    // Verify client exists and is a client role
    const clientUser = await User.findById(client);
    if (!clientUser || clientUser.role !== UserRole.CLIENT) {
      return next(new AppError("Invalid client specified", 400));
    }

    // Verify vehicle exists and is available
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return next(new AppError("Vehicle not found", 404));
    }

    if (vehicleDoc.status !== VehicleStatus.AVAILABLE) {
      return next(new AppError("Vehicle is not available for lease", 400));
    }

    // Create lease agreement
    const lease = await LeaseAgreement.create({
      client,
      vehicle,
      salesPerson: req.user!.userId,
      startDate,
      endDate,
      monthlyPayment,
      downPayment,
      totalAmount,
      interestRate,
      terms,
      notes,
      status: LeaseStatus.PENDING,
    });

    // Update vehicle status to reserved
    await Vehicle.findByIdAndUpdate(vehicle, {
      status: VehicleStatus.RESERVED,
    });

    // Populate the created lease
    const populatedLease = await LeaseAgreement.findById(lease._id)
      .populate("client", "firstName lastName email")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("salesPerson", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Lease created successfully",
      data: { lease: populatedLease },
    };

    res.status(201).json(response);
  }
);

// Update lease
export const updateLease = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;

    const lease = await LeaseAgreement.findById(id);
    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    // Don't allow updating completed or cancelled leases
    if ([LeaseStatus.COMPLETED, LeaseStatus.CANCELLED].includes(lease.status)) {
      return next(
        new AppError("Cannot update completed or cancelled lease", 400)
      );
    }

    // Remove fields that shouldn't be updated directly
    delete updates.leaseNumber;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updatedLease = await LeaseAgreement.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("client", "firstName lastName email")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("salesPerson", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Lease updated successfully",
      data: { lease: updatedLease },
    };

    res.status(200).json(response);
  }
);

// Delete lease
export const deleteLease = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const lease = await LeaseAgreement.findById(id);
    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    // Only allow deletion of pending leases
    if (lease.status !== LeaseStatus.PENDING) {
      return next(new AppError("Only pending leases can be deleted", 400));
    }

    // Free up the vehicle
    await Vehicle.findByIdAndUpdate(lease.vehicle, {
      status: VehicleStatus.AVAILABLE,
    });

    await LeaseAgreement.findByIdAndDelete(id);

    const response: IApiResponse = {
      success: true,
      message: "Lease deleted successfully",
    };

    res.status(200).json(response);
  }
);

// Update lease status
export const updateLeaseStatus = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(LeaseStatus).includes(status)) {
      return next(new AppError("Invalid lease status", 400));
    }

    const lease = await LeaseAgreement.findById(id);
    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    const oldStatus = lease.status;
    lease.status = status;

    // Handle vehicle status changes based on lease status
    if (status === LeaseStatus.ACTIVE && oldStatus === LeaseStatus.APPROVED) {
      await Vehicle.findByIdAndUpdate(lease.vehicle, {
        status: VehicleStatus.LEASED,
      });
    } else if (
      status === LeaseStatus.COMPLETED ||
      status === LeaseStatus.CANCELLED
    ) {
      await Vehicle.findByIdAndUpdate(lease.vehicle, {
        status: VehicleStatus.AVAILABLE,
      });
    } else if (
      status === LeaseStatus.CANCELLED &&
      oldStatus === LeaseStatus.PENDING
    ) {
      await Vehicle.findByIdAndUpdate(lease.vehicle, {
        status: VehicleStatus.AVAILABLE,
      });
    }

    await lease.save();

    const updatedLease = await LeaseAgreement.findById(id)
      .populate("client", "firstName lastName email")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("salesPerson", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: `Lease status updated to ${status}`,
      data: { lease: updatedLease },
    };

    res.status(200).json(response);
  }
);

// Approve lease
export const approveLease = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const lease = await LeaseAgreement.findById(id);
    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    if (lease.status !== LeaseStatus.PENDING) {
      return next(new AppError("Only pending leases can be approved", 400));
    }

    lease.status = LeaseStatus.APPROVED;
    await lease.save();

    const updatedLease = await LeaseAgreement.findById(id)
      .populate("client", "firstName lastName email")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("salesPerson", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Lease approved successfully",
      data: { lease: updatedLease },
    };

    res.status(200).json(response);
  }
);

// Complete lease
export const completeLease = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const lease = await LeaseAgreement.findById(id);
    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    if (lease.status !== LeaseStatus.ACTIVE) {
      return next(new AppError("Only active leases can be completed", 400));
    }

    lease.status = LeaseStatus.COMPLETED;
    await lease.save();

    // Make vehicle available again
    await Vehicle.findByIdAndUpdate(lease.vehicle, {
      status: VehicleStatus.AVAILABLE,
    });

    const updatedLease = await LeaseAgreement.findById(id)
      .populate("client", "firstName lastName email")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("salesPerson", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Lease completed successfully",
      data: { lease: updatedLease },
    };

    res.status(200).json(response);
  }
);

// Request early buyout
export const requestEarlyBuyout = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { requestedAmount, reason } = req.body;

    const lease = await LeaseAgreement.findById(id);
    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    if (lease.status !== LeaseStatus.ACTIVE) {
      return next(
        new AppError("Only active leases can request early buyout", 400)
      );
    }

    // Check if client owns this lease
    if (
      req.user?.role === UserRole.CLIENT &&
      lease.client.toString() !== req.user.userId
    ) {
      return next(
        new AppError("Not authorized to request buyout for this lease", 403)
      );
    }

    // Calculate early buyout amount (remaining balance + early termination fee)
    const buyoutAmount =
      lease.remainingBalance + lease.terms.earlyTerminationFee;

    // Add buyout request to lease notes
    const buyoutNote = `Early buyout requested on ${new Date().toISOString()}. 
    Requested amount: $${requestedAmount || buyoutAmount}. 
    Calculated amount: $${buyoutAmount}. 
    Reason: ${reason || "Not specified"}`;

    lease.notes = lease.notes ? `${lease.notes}\n\n${buyoutNote}` : buyoutNote;
    await lease.save();

    const response: IApiResponse = {
      success: true,
      message: "Early buyout request submitted successfully",
      data: {
        lease: lease._id,
        calculatedBuyoutAmount: buyoutAmount,
        requestedAmount: requestedAmount || buyoutAmount,
      },
    };

    res.status(200).json(response);
  }
);
