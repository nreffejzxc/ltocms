import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Payment from "../models/Payment";
import LeaseAgreement from "../models/LeaseAgreement";
import User from "../models/User";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { IApiResponse, IAuthRequest, PaymentStatus, UserRole } from "../types";

// Get all payments
export const getAllPayments = asyncHandler(
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
        { paymentNumber: { $regex: search, $options: "i" } },
        { receiptNumber: { $regex: search, $options: "i" } },
        { transactionId: { $regex: search, $options: "i" } },
      ];
    }

    if (
      status &&
      Object.values(PaymentStatus).includes(status as PaymentStatus)
    ) {
      query.status = status;
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("client", "firstName lastName email phone")
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName")
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Payments retrieved successfully",
      data: {
        payments,
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

// Get current user's payments (for clients)
export const getMyPayments = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments({ client: req.user.userId });
    const payments = await Payment.find({ client: req.user.userId })
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Your payments retrieved successfully",
      data: {
        payments,
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

// Get overdue payments
export const getOverduePayments = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const today = new Date();
    const payments = await Payment.find({
      status: PaymentStatus.PENDING,
      dueDate: { $lt: today },
    })
      .populate("client", "firstName lastName email phone")
      .populate("lease", "leaseNumber monthlyPayment")
      .sort("dueDate");

    const response: IApiResponse = {
      success: true,
      message: "Overdue payments retrieved successfully",
      data: { payments },
    };

    res.status(200).json(response);
  }
);

// Get payment statistics
export const getPaymentStats = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({
      status: PaymentStatus.COMPLETED,
    });
    const pendingPayments = await Payment.countDocuments({
      status: PaymentStatus.PENDING,
    });
    const failedPayments = await Payment.countDocuments({
      status: PaymentStatus.FAILED,
    });
    const refundedPayments = await Payment.countDocuments({
      status: PaymentStatus.REFUNDED,
    });

    // Calculate total revenue
    const revenueData = await Payment.aggregate([
      { $match: { status: PaymentStatus.COMPLETED } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Calculate overdue payments
    const today = new Date();
    const overduePayments = await Payment.countDocuments({
      status: PaymentStatus.PENDING,
      dueDate: { $lt: today },
    });

    // Monthly payment stats
    const monthlyStats = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
          },
          status: PaymentStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Payment method distribution
    const methodDistribution = await Payment.aggregate([
      { $match: { status: PaymentStatus.COMPLETED } },
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const response: IApiResponse = {
      success: true,
      message: "Payment statistics retrieved successfully",
      data: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        refundedPayments,
        overduePayments,
        totalRevenue,
        monthlyStats,
        methodDistribution,
      },
    };

    res.status(200).json(response);
  }
);

// Get payments for a specific lease
export const getPaymentsByLease = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { leaseId } = req.params;

    const lease = await LeaseAgreement.findById(leaseId);
    if (!lease) {
      return next(new AppError("Lease not found", 404));
    }

    // Check if client can only access their own lease payments
    if (
      req.user?.role === UserRole.CLIENT &&
      lease.client.toString() !== req.user.userId
    ) {
      return next(new AppError("Not authorized to access these payments", 403));
    }

    const payments = await Payment.find({ lease: leaseId })
      .populate("processedBy", "firstName lastName")
      .sort("-createdAt");

    const response: IApiResponse = {
      success: true,
      message: "Lease payments retrieved successfully",
      data: { payments },
    };

    res.status(200).json(response);
  }
);

// Get payment by ID
export const getPaymentById = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("client", "firstName lastName email phone address")
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName email");

    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    // Check if client can only access their own payments
    if (
      req.user?.role === UserRole.CLIENT &&
      payment.client.toString() !== req.user.userId
    ) {
      return next(new AppError("Not authorized to access this payment", 403));
    }

    const response: IApiResponse = {
      success: true,
      message: "Payment retrieved successfully",
      data: { payment },
    };

    res.status(200).json(response);
  }
);

// Get payment receipt
export const getPaymentReceipt = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("client", "firstName lastName email phone address")
      .populate("lease", "leaseNumber monthlyPayment vehicle")
      .populate("processedBy", "firstName lastName")
      .populate({
        path: "lease",
        populate: {
          path: "vehicle",
          select: "make vehicleModel year vin",
        },
      });

    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    // Check if client can only access their own payment receipts
    if (
      req.user?.role === UserRole.CLIENT &&
      payment.client.toString() !== req.user.userId
    ) {
      return next(new AppError("Not authorized to access this receipt", 403));
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      return next(
        new AppError("Receipt only available for completed payments", 400)
      );
    }

    const response: IApiResponse = {
      success: true,
      message: "Payment receipt retrieved successfully",
      data: { payment },
    };

    res.status(200).json(response);
  }
);

// Create new payment
export const createPayment = asyncHandler(
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
      lease,
      client,
      amount,
      dueDate,
      method,
      transactionId,
      notes,
      lateFee,
    } = req.body;

    // Verify lease exists
    const leaseDoc = await LeaseAgreement.findById(lease);
    if (!leaseDoc) {
      return next(new AppError("Lease not found", 404));
    }

    // Verify client exists and matches lease
    const clientUser = await User.findById(client);
    if (!clientUser || clientUser.role !== UserRole.CLIENT) {
      return next(new AppError("Invalid client specified", 400));
    }

    if (leaseDoc.client.toString() !== client) {
      return next(new AppError("Client does not match lease", 400));
    }

    // Check if payment is late
    const today = new Date();
    const paymentDueDate = new Date(dueDate);
    const isLatePayment = today > paymentDueDate;

    // Generate payment and receipt numbers
    const year = new Date().getFullYear();
    const paymentCount = await Payment.countDocuments();
    const paymentNumber = `PAY-${year}-${String(paymentCount + 1).padStart(
      6,
      "0"
    )}`;
    const receiptNumber = `RCP-${year}-${String(paymentCount + 1).padStart(
      6,
      "0"
    )}`;

    // Create payment
    const payment = await Payment.create({
      paymentNumber,
      lease,
      client,
      amount: amount + (lateFee || 0),
      paymentDate: new Date(),
      dueDate: paymentDueDate,
      method,
      status: PaymentStatus.COMPLETED, // Assuming immediate processing
      transactionId,
      receiptNumber,
      notes,
      processedBy: req.user!.userId,
      isLatePayment,
      lateFee: lateFee || 0,
    });

    // Update lease remaining balance
    leaseDoc.remainingBalance = Math.max(0, leaseDoc.remainingBalance - amount);
    await leaseDoc.save();

    // Populate the created payment
    const populatedPayment = await Payment.findById(payment._id)
      .populate("client", "firstName lastName email")
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Payment created successfully",
      data: { payment: populatedPayment },
    };

    res.status(201).json(response);
  }
);

// Update payment
export const updatePayment = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    // Don't allow updating completed payments
    if (payment.status === PaymentStatus.COMPLETED) {
      return next(new AppError("Cannot update completed payments", 400));
    }

    // Remove fields that shouldn't be updated directly
    delete updates.paymentNumber;
    delete updates.receiptNumber;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updatedPayment = await Payment.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("client", "firstName lastName email")
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Payment updated successfully",
      data: { payment: updatedPayment },
    };

    res.status(200).json(response);
  }
);

// Delete payment
export const deletePayment = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    // Only allow deletion of pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      return next(new AppError("Only pending payments can be deleted", 400));
    }

    await Payment.findByIdAndDelete(id);

    const response: IApiResponse = {
      success: true,
      message: "Payment deleted successfully",
    };

    res.status(200).json(response);
  }
);

// Update payment status
export const updatePaymentStatus = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(PaymentStatus).includes(status)) {
      return next(new AppError("Invalid payment status", 400));
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    const oldStatus = payment.status;
    payment.status = status;

    // Update payment date when marking as completed
    if (
      status === PaymentStatus.COMPLETED &&
      oldStatus !== PaymentStatus.COMPLETED
    ) {
      payment.paymentDate = new Date();

      // Update lease remaining balance
      const lease = await LeaseAgreement.findById(payment.lease);
      if (lease) {
        lease.remainingBalance = Math.max(
          0,
          lease.remainingBalance - payment.amount
        );
        await lease.save();
      }
    }

    await payment.save();

    const updatedPayment = await Payment.findById(id)
      .populate("client", "firstName lastName email")
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: `Payment status updated to ${status}`,
      data: { payment: updatedPayment },
    };

    res.status(200).json(response);
  }
);

// Mark payment as completed
export const completePayment = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return next(new AppError("Payment is already completed", 400));
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.paymentDate = new Date();
    await payment.save();

    // Update lease remaining balance
    const lease = await LeaseAgreement.findById(payment.lease);
    if (lease) {
      lease.remainingBalance = Math.max(
        0,
        lease.remainingBalance - payment.amount
      );
      await lease.save();
    }

    const updatedPayment = await Payment.findById(id)
      .populate("client", "firstName lastName email")
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Payment completed successfully",
      data: { payment: updatedPayment },
    };

    res.status(200).json(response);
  }
);

// Refund payment
export const refundPayment = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      return next(new AppError("Only completed payments can be refunded", 400));
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.notes = payment.notes
      ? `${payment.notes}\n\nRefund reason: ${reason}`
      : `Refund reason: ${reason}`;
    await payment.save();

    // Update lease remaining balance (add back the refunded amount)
    const lease = await LeaseAgreement.findById(payment.lease);
    if (lease) {
      lease.remainingBalance += payment.amount;
      await lease.save();
    }

    const updatedPayment = await Payment.findById(id)
      .populate("client", "firstName lastName email")
      .populate("lease", "leaseNumber monthlyPayment")
      .populate("processedBy", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Payment refunded successfully",
      data: { payment: updatedPayment },
    };

    res.status(200).json(response);
  }
);

// Bulk create payments (for monthly billing)
export const bulkCreatePayments = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { payments } = req.body;

    if (!payments || !Array.isArray(payments)) {
      return next(new AppError("Payments array is required", 400));
    }

    const createdPayments = [];
    const errors = [];

    for (const paymentData of payments) {
      try {
        // Verify lease exists
        const lease = await LeaseAgreement.findById(paymentData.lease);
        if (!lease) {
          errors.push(`Lease ${paymentData.lease} not found`);
          continue;
        }

        // Generate payment and receipt numbers
        const year = new Date().getFullYear();
        const paymentCount = await Payment.countDocuments();
        const paymentNumber: string = `PAY-${year}-${String(
          paymentCount + createdPayments.length + 1
        ).padStart(6, "0")}`;
        const receiptNumber: string = `RCP-${year}-${String(
          paymentCount + createdPayments.length + 1
        ).padStart(6, "0")}`;

        const payment = await Payment.create({
          ...paymentData,
          paymentNumber,
          receiptNumber,
          processedBy: req.user!.userId,
          status: PaymentStatus.PENDING,
        });

        createdPayments.push(payment);
      } catch (error) {
        errors.push(
          `Error creating payment for lease ${paymentData.lease}: ${error}`
        );
      }
    }

    const response: IApiResponse = {
      success: true,
      message: `${createdPayments.length} payments created successfully`,
      data: {
        createdPayments,
        errors: errors.length > 0 ? errors : undefined,
      },
    };

    res.status(201).json(response);
  }
);
