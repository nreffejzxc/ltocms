import mongoose, { Schema, Document } from "mongoose";

// Lease Application Status
export enum LeaseApplicationStatus {
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  CONVERTED = "converted", // Converted to actual lease
}

// Lease Application Interface
export interface ILeaseApplication extends Document {
  _id: string;
  applicationNumber: string;
  client: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  requestedStartDate: Date;
  requestedDuration: number; // in months
  monthlyBudget: number;
  downPaymentAmount: number;
  employmentInfo: {
    employer: string;
    position: string;
    monthlyIncome: number;
    employmentDuration: number; // in months
  };
  personalInfo: {
    driversLicense: string;
    licenseExpiry: Date;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  status: LeaseApplicationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  rejectionReason?: string;
  convertedLeaseId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Lease Application Schema
const leaseApplicationSchema = new Schema<ILeaseApplication>(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    requestedStartDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v: Date) {
          return v >= new Date(Date.now() - 24 * 60 * 60 * 1000); // Allow today or future
        },
        message: "Requested start date cannot be in the past",
      },
    },
    requestedDuration: {
      type: Number,
      required: true,
      min: [6, "Minimum lease duration is 6 months"],
      max: [120, "Maximum lease duration is 120 months"],
    },
    monthlyBudget: {
      type: Number,
      required: true,
      min: [100, "Monthly budget must be at least $100"],
    },
    downPaymentAmount: {
      type: Number,
      required: true,
      min: [0, "Down payment cannot be negative"],
    },
    employmentInfo: {
      employer: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, "Employer name cannot exceed 100 characters"],
      },
      position: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, "Position cannot exceed 100 characters"],
      },
      monthlyIncome: {
        type: Number,
        required: true,
        min: [500, "Monthly income must be at least $500"],
      },
      employmentDuration: {
        type: Number,
        required: true,
        min: [1, "Employment duration must be at least 1 month"],
      },
    },
    personalInfo: {
      driversLicense: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, "Driver's license number cannot exceed 50 characters"],
      },
      licenseExpiry: {
        type: Date,
        required: true,
        validate: {
          validator: function (v: Date) {
            return v > new Date();
          },
          message: "Driver's license must not be expired",
        },
      },
      emergencyContact: {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: [
            100,
            "Emergency contact name cannot exceed 100 characters",
          ],
        },
        relationship: {
          type: String,
          required: true,
          trim: true,
          maxlength: [50, "Relationship cannot exceed 50 characters"],
        },
        phone: {
          type: String,
          required: true,
          trim: true,
          match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
        },
      },
    },
    status: {
      type: String,
      enum: Object.values(LeaseApplicationStatus),
      default: LeaseApplicationStatus.SUBMITTED,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Review notes cannot exceed 1000 characters"],
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    convertedLeaseId: {
      type: Schema.Types.ObjectId,
      ref: "LeaseAgreement",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Note: applicationNumber already has unique index from schema definition
leaseApplicationSchema.index({ client: 1 });
leaseApplicationSchema.index({ vehicle: 1 });
leaseApplicationSchema.index({ status: 1 });
leaseApplicationSchema.index({ submittedAt: -1 });

// Pre-save middleware to generate application number
leaseApplicationSchema.pre("save", async function (next) {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("LeaseApplication").countDocuments();
    this.applicationNumber = `APP-${year}-${String(count + 1).padStart(
      6,
      "0"
    )}`;
  }
  next();
});

export default mongoose.model<ILeaseApplication>(
  "LeaseApplication",
  leaseApplicationSchema
);
