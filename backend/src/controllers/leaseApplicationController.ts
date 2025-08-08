import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { IApiResponse, IAuthRequest, UserRole } from "../types";
import LeaseApplication, {
  LeaseApplicationStatus,
} from "../models/LeaseApplication";

// Get all lease applications (staff only)
export const getAllLeaseApplications = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const sortBy = (req.query.sort as string) || "-submittedAt";

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [{ applicationNumber: { $regex: search, $options: "i" } }];
    }

    if (
      status &&
      Object.values(LeaseApplicationStatus).includes(
        status as LeaseApplicationStatus
      )
    ) {
      query.status = status;
    }

    const total = await LeaseApplication.countDocuments(query);
    const applications = await LeaseApplication.find(query)
      .populate("client", "firstName lastName email phone")
      .populate("vehicle", "make vehicleModel year vin color leasePrice")
      .populate("reviewedBy", "firstName lastName")
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Lease applications retrieved successfully",
      data: {
        applications,
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

// Get current user's lease applications (for clients)
export const getMyLeaseApplications = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await LeaseApplication.countDocuments({
      client: req.user.userId,
    });
    const applications = await LeaseApplication.find({
      client: req.user.userId,
    })
      .populate("vehicle", "make vehicleModel year vin color leasePrice images")
      .populate("reviewedBy", "firstName lastName")
      .sort("-submittedAt")
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Your lease applications retrieved successfully",
      data: {
        applications,
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

// Get lease application by ID
export const getLeaseApplicationById = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const application = await LeaseApplication.findById(id)
      .populate("client", "firstName lastName email phone address")
      .populate("vehicle")
      .populate("reviewedBy", "firstName lastName email")
      .populate("convertedLeaseId");

    if (!application) {
      return next(new AppError("Lease application not found", 404));
    }

    // Check if client can only access their own applications
    if (
      req.user?.role === UserRole.CLIENT &&
      application.client.toString() !== req.user.userId
    ) {
      return next(
        new AppError("Not authorized to access this application", 403)
      );
    }

    const response: IApiResponse = {
      success: true,
      message: "Lease application retrieved successfully",
      data: { application },
    };

    res.status(200).json(response);
  }
);

// Submit new lease application (clients only)
export const submitLeaseApplication = asyncHandler(
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

    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    const {
      vehicle,
      requestedStartDate,
      requestedDuration,
      monthlyBudget,
      downPaymentAmount,
      employmentInfo,
      personalInfo,
    } = req.body;

    // Verify vehicle exists and is available
    const Vehicle = require("../models/Vehicle").default;
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return next(new AppError("Vehicle not found", 404));
    }

    if (vehicleDoc.status !== "available") {
      return next(new AppError("Vehicle is not available for lease", 400));
    }

    // Check if client already has a pending application for this vehicle
    const existingApplication = await LeaseApplication.findOne({
      client: req.user.userId,
      vehicle,
      status: {
        $in: [
          LeaseApplicationStatus.SUBMITTED,
          LeaseApplicationStatus.UNDER_REVIEW,
        ],
      },
    });

    if (existingApplication) {
      return next(
        new AppError(
          "You already have a pending application for this vehicle",
          400
        )
      );
    }

    // Create lease application
    const application = await LeaseApplication.create({
      client: req.user.userId,
      vehicle,
      requestedStartDate,
      requestedDuration,
      monthlyBudget,
      downPaymentAmount,
      employmentInfo,
      personalInfo,
      status: LeaseApplicationStatus.SUBMITTED,
    });

    // Populate the created application
    const populatedApplication = await LeaseApplication.findById(
      application._id
    )
      .populate("client", "firstName lastName email")
      .populate("vehicle", "make vehicleModel year vin color leasePrice");

    const response: IApiResponse = {
      success: true,
      message: "Lease application submitted successfully",
      data: { application: populatedApplication },
    };

    res.status(201).json(response);
  }
);

// Update lease application status (staff only)
export const updateApplicationStatus = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, reviewNotes, rejectionReason } = req.body;

    if (!Object.values(LeaseApplicationStatus).includes(status)) {
      return next(new AppError("Invalid application status", 400));
    }

    const application = await LeaseApplication.findById(id);
    if (!application) {
      return next(new AppError("Lease application not found", 404));
    }

    // Don't allow updating converted applications
    if (application.status === LeaseApplicationStatus.CONVERTED) {
      return next(new AppError("Cannot update converted applications", 400));
    }

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user!.userId as any;

    if (reviewNotes) {
      application.reviewNotes = reviewNotes;
    }

    if (status === LeaseApplicationStatus.REJECTED && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    const updatedApplication = await LeaseApplication.findById(id)
      .populate("client", "firstName lastName email")
      .populate("vehicle", "make vehicleModel year vin")
      .populate("reviewedBy", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: `Application status updated to ${status}`,
      data: { application: updatedApplication },
    };

    res.status(200).json(response);
  }
);

// Convert application to lease agreement (sales staff only)
export const convertToLease = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      actualStartDate,
      actualEndDate,
      finalMonthlyPayment,
      finalDownPayment,
      finalTotalAmount,
      interestRate,
      terms,
    } = req.body;

    const application = await LeaseApplication.findById(id);
    if (!application) {
      return next(new AppError("Lease application not found", 404));
    }

    if (application.status !== LeaseApplicationStatus.APPROVED) {
      return next(
        new AppError(
          "Only approved applications can be converted to leases",
          400
        )
      );
    }

    // Create the actual lease agreement
    const LeaseAgreement = require("../models/LeaseAgreement").default;
    const lease = await LeaseAgreement.create({
      client: application.client,
      vehicle: application.vehicle,
      salesPerson: req.user!.userId,
      startDate: actualStartDate || application.requestedStartDate,
      endDate: actualEndDate,
      monthlyPayment: finalMonthlyPayment,
      downPayment: finalDownPayment || application.downPaymentAmount,
      totalAmount: finalTotalAmount,
      interestRate,
      terms,
      notes: `Converted from application ${application.applicationNumber}`,
    });

    // Update application status and link to lease
    application.status = LeaseApplicationStatus.CONVERTED;
    application.convertedLeaseId = lease._id as any;
    await application.save();

    // Update vehicle status to reserved
    const Vehicle = require("../models/Vehicle").default;
    await Vehicle.findByIdAndUpdate(application.vehicle, {
      status: "reserved",
    });

    const response: IApiResponse = {
      success: true,
      message: "Application converted to lease agreement successfully",
      data: {
        application: application._id,
        lease: lease._id,
        leaseNumber: lease.leaseNumber,
      },
    };

    res.status(201).json(response);
  }
);

// Get application statistics
export const getApplicationStats = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const totalApplications = await LeaseApplication.countDocuments();
    const submittedApplications = await LeaseApplication.countDocuments({
      status: LeaseApplicationStatus.SUBMITTED,
    });
    const underReviewApplications = await LeaseApplication.countDocuments({
      status: LeaseApplicationStatus.UNDER_REVIEW,
    });
    const approvedApplications = await LeaseApplication.countDocuments({
      status: LeaseApplicationStatus.APPROVED,
    });
    const rejectedApplications = await LeaseApplication.countDocuments({
      status: LeaseApplicationStatus.REJECTED,
    });
    const convertedApplications = await LeaseApplication.countDocuments({
      status: LeaseApplicationStatus.CONVERTED,
    });

    // Monthly application stats
    const monthlyStats = await LeaseApplication.aggregate([
      {
        $match: {
          submittedAt: {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$submittedAt" },
            month: { $month: "$submittedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Conversion rate
    const conversionRate =
      totalApplications > 0
        ? (convertedApplications / totalApplications) * 100
        : 0;

    const response: IApiResponse = {
      success: true,
      message: "Application statistics retrieved successfully",
      data: {
        totalApplications,
        submittedApplications,
        underReviewApplications,
        approvedApplications,
        rejectedApplications,
        convertedApplications,
        conversionRate: Math.round(conversionRate * 100) / 100,
        monthlyStats,
      },
    };

    res.status(200).json(response);
  }
);
