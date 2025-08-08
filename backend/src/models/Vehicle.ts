import mongoose, { Schema } from "mongoose";
import { IVehicle, VehicleStatus } from "../types";

const vehicleSchema = new Schema<IVehicle>(
  {
    make: {
      type: String,
      required: [true, "Vehicle make is required"],
      trim: true,
      maxlength: [50, "Make cannot exceed 50 characters"],
    },
    vehicleModel: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
      maxlength: [50, "Model cannot exceed 50 characters"],
    },
    year: {
      type: Number,
      required: [true, "Vehicle year is required"],
      min: [1900, "Year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
    },
    vin: {
      type: String,
      required: [true, "VIN is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [17, "VIN must be exactly 17 characters"],
      maxlength: [17, "VIN must be exactly 17 characters"],
      match: [/^[A-HJ-NPR-Z0-9]{17}$/, "Please enter a valid VIN"],
    },
    color: {
      type: String,
      required: [true, "Vehicle color is required"],
      trim: true,
      maxlength: [30, "Color cannot exceed 30 characters"],
    },
    mileage: {
      type: Number,
      required: [true, "Vehicle mileage is required"],
      min: [0, "Mileage cannot be negative"],
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      required: [true, "Vehicle condition is required"],
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.AVAILABLE,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    leasePrice: {
      type: Number,
      required: [true, "Lease price is required"],
      min: [0, "Lease price cannot be negative"],
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v: string) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
          },
          message: "Please provide a valid image URL",
        },
      },
    ],
    features: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Feature description cannot exceed 100 characters"],
      },
    ],
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    location: {
      type: String,
      required: [true, "Vehicle location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Note: vin already has unique index from schema definition
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ make: 1, vehicleModel: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ createdBy: 1 });
vehicleSchema.index({ createdAt: -1 });

// Virtual for vehicle display name
vehicleSchema.virtual("displayName").get(function () {
  return `${this.year} ${this.make} ${this.vehicleModel}`;
});

// Virtual for age calculation
vehicleSchema.virtual("age").get(function () {
  return new Date().getFullYear() - this.year;
});

// Pre-save middleware to ensure VIN is uppercase
vehicleSchema.pre("save", function (next) {
  if (this.vin) {
    this.vin = this.vin.toUpperCase();
  }
  next();
});

// Static method to find available vehicles
vehicleSchema.statics.findAvailable = function () {
  return this.find({ status: VehicleStatus.AVAILABLE });
};

// Static method to find vehicles by make and model
vehicleSchema.statics.findByMakeModel = function (
  make: string,
  vehicleModel: string
) {
  return this.find({
    make: new RegExp(make, "i"),
    vehicleModel: new RegExp(vehicleModel, "i"),
  });
};

export default mongoose.model<IVehicle>("Vehicle", vehicleSchema);
