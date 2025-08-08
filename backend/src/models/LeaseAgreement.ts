import mongoose, { Schema } from "mongoose";
import { ILeaseAgreement, LeaseStatus } from "../types";

const termsSchema = new Schema(
  {
    duration: {
      type: Number,
      required: [true, "Lease duration is required"],
      min: [1, "Duration must be at least 1 month"],
      max: [120, "Duration cannot exceed 120 months"],
    },
    mileageLimit: {
      type: Number,
      required: [true, "Mileage limit is required"],
      min: [0, "Mileage limit cannot be negative"],
    },
    earlyTerminationFee: {
      type: Number,
      required: [true, "Early termination fee is required"],
      min: [0, "Early termination fee cannot be negative"],
    },
    latePaymentFee: {
      type: Number,
      required: [true, "Late payment fee is required"],
      min: [0, "Late payment fee cannot be negative"],
    },
  },
  { _id: false }
);

const documentsSchema = new Schema(
  {
    contract: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+\.(pdf|doc|docx)$/i.test(v);
        },
        message: "Contract must be a valid document URL",
      },
    },
    insurance: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(v);
        },
        message: "Insurance document must be a valid URL",
      },
    },
    registration: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(v);
        },
        message: "Registration document must be a valid URL",
      },
    },
  },
  { _id: false }
);

const leaseAgreementSchema = new Schema<ILeaseAgreement>(
  {
    leaseNumber: {
      type: String,
      required: [true, "Lease number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
    },
    salesPerson: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sales person is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (v: Date) {
          return v >= new Date(Date.now() - 24 * 60 * 60 * 1000); // Allow today or future
        },
        message: "Start date cannot be in the past",
      },
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (this: ILeaseAgreement, v: Date) {
          return v > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    monthlyPayment: {
      type: Number,
      required: [true, "Monthly payment is required"],
      min: [0, "Monthly payment cannot be negative"],
    },
    downPayment: {
      type: Number,
      required: [true, "Down payment is required"],
      min: [0, "Down payment cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    remainingBalance: {
      type: Number,
      required: [true, "Remaining balance is required"],
      min: [0, "Remaining balance cannot be negative"],
    },
    interestRate: {
      type: Number,
      required: [true, "Interest rate is required"],
      min: [0, "Interest rate cannot be negative"],
      max: [100, "Interest rate cannot exceed 100%"],
    },
    status: {
      type: String,
      enum: Object.values(LeaseStatus),
      default: LeaseStatus.PENDING,
      required: true,
    },
    terms: {
      type: termsSchema,
      required: [true, "Lease terms are required"],
    },
    documents: {
      type: documentsSchema,
      default: {},
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Note: leaseNumber already has unique index from schema definition
leaseAgreementSchema.index({ client: 1 });
leaseAgreementSchema.index({ vehicle: 1 });
leaseAgreementSchema.index({ salesPerson: 1 });
leaseAgreementSchema.index({ status: 1 });
leaseAgreementSchema.index({ startDate: 1 });
leaseAgreementSchema.index({ endDate: 1 });
leaseAgreementSchema.index({ createdAt: -1 });

// Virtual for lease duration in months
leaseAgreementSchema.virtual("durationMonths").get(function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
});

// Virtual for progress percentage
leaseAgreementSchema.virtual("progressPercentage").get(function () {
  if (this.totalAmount === 0) return 0;
  const paidAmount = this.totalAmount - this.remainingBalance;
  return Math.round((paidAmount / this.totalAmount) * 100);
});

// Virtual for days remaining
leaseAgreementSchema.virtual("daysRemaining").get(function () {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate lease number
leaseAgreementSchema.pre("save", async function (next) {
  if (!this.leaseNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("LeaseAgreement").countDocuments();
    this.leaseNumber = `LSE-${year}-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Pre-save middleware to calculate remaining balance
leaseAgreementSchema.pre("save", function (next) {
  if (this.isNew) {
    this.remainingBalance = this.totalAmount - this.downPayment;
  }
  next();
});

// Static method to find active leases
leaseAgreementSchema.statics.findActive = function () {
  return this.find({ status: LeaseStatus.ACTIVE });
};

// Static method to find leases by client
leaseAgreementSchema.statics.findByClient = function (clientId: string) {
  return this.find({ client: clientId })
    .populate("vehicle")
    .populate("salesPerson", "firstName lastName");
};

// Static method to find overdue leases
leaseAgreementSchema.statics.findOverdue = function () {
  const today = new Date();
  return this.find({
    status: LeaseStatus.ACTIVE,
    endDate: { $lt: today },
  });
};

export default mongoose.model<ILeaseAgreement>(
  "LeaseAgreement",
  leaseAgreementSchema
);
