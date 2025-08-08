import mongoose, { Schema } from "mongoose";
import { IPayment, PaymentStatus, PaymentMethod } from "../types";

const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: {
      type: String,
      required: [true, "Payment number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    lease: {
      type: Schema.Types.ObjectId,
      ref: "LeaseAgreement",
      required: [true, "Lease agreement is required"],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Payment amount must be greater than 0"],
    },
    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, "Payment method is required"],
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
      sparse: true, // Allows multiple null values but unique non-null values
    },
    receiptNumber: {
      type: String,
      required: [true, "Receipt number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Processed by user is required"],
    },
    isLatePayment: {
      type: Boolean,
      default: false,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: [0, "Late fee cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Note: paymentNumber and receiptNumber already have unique indexes from schema definition
paymentSchema.index({ lease: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ processedBy: 1 });
paymentSchema.index({ createdAt: -1 });

// Compound indexes
paymentSchema.index({ lease: 1, paymentDate: -1 });
paymentSchema.index({ client: 1, status: 1 });

// Virtual for total amount including late fee
paymentSchema.virtual("totalAmount").get(function () {
  return this.amount + (this.lateFee || 0);
});

// Virtual for days overdue
paymentSchema.virtual("daysOverdue").get(function () {
  if (this.status === PaymentStatus.COMPLETED) return 0;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for payment status display
paymentSchema.virtual("statusDisplay").get(function () {
  const statusMap = {
    [PaymentStatus.PENDING]: "Pending",
    [PaymentStatus.COMPLETED]: "Completed",
    [PaymentStatus.FAILED]: "Failed",
    [PaymentStatus.REFUNDED]: "Refunded",
    [PaymentStatus.CANCELLED]: "Cancelled",
  };
  return statusMap[this.status] || this.status;
});

// Pre-save middleware to generate payment number
paymentSchema.pre("save", async function (next) {
  if (!this.paymentNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const count = await mongoose.model("Payment").countDocuments();
    this.paymentNumber = `PAY-${year}${month}-${String(count + 1).padStart(
      6,
      "0"
    )}`;
  }
  next();
});

// Pre-save middleware to generate receipt number
paymentSchema.pre("save", async function (next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const count = await mongoose.model("Payment").countDocuments();
    this.receiptNumber = `RCP-${year}${month}-${String(count + 1).padStart(
      6,
      "0"
    )}`;
  }
  next();
});

// Pre-save middleware to check if payment is late
paymentSchema.pre("save", function (next) {
  if (this.paymentDate && this.dueDate) {
    this.isLatePayment = new Date(this.paymentDate) > new Date(this.dueDate);
  }
  next();
});

// Static method to find overdue payments
paymentSchema.statics.findOverdue = function () {
  const today = new Date();
  return this.find({
    status: { $in: [PaymentStatus.PENDING] },
    dueDate: { $lt: today },
  });
};

// Static method to find payments by lease
paymentSchema.statics.findByLease = function (leaseId: string) {
  return this.find({ lease: leaseId })
    .populate("processedBy", "firstName lastName")
    .sort({ paymentDate: -1 });
};

// Static method to find payments by client
paymentSchema.statics.findByClient = function (clientId: string) {
  return this.find({ client: clientId })
    .populate("lease", "leaseNumber")
    .populate("processedBy", "firstName lastName")
    .sort({ paymentDate: -1 });
};

// Static method to calculate total payments for a lease
paymentSchema.statics.getTotalPaidForLease = async function (leaseId: string) {
  const result = await this.aggregate([
    {
      $match: {
        lease: new mongoose.Types.ObjectId(leaseId),
        status: PaymentStatus.COMPLETED,
      },
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: "$amount" },
        totalLateFees: { $sum: "$lateFee" },
      },
    },
  ]);

  return result.length > 0 ? result[0] : { totalPaid: 0, totalLateFees: 0 };
};

export default mongoose.model<IPayment>("Payment", paymentSchema);
