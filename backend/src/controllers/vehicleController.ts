import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Vehicle from "../models/Vehicle";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { IApiResponse, IAuthRequest, VehicleStatus } from "../types";

// Get all vehicles
export const getAllVehicles = asyncHandler(
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
        { make: { $regex: search, $options: "i" } },
        { vehicleModel: { $regex: search, $options: "i" } },
        { vin: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ];
    }

    if (
      status &&
      Object.values(VehicleStatus).includes(status as VehicleStatus)
    ) {
      query.status = status;
    }

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .populate("createdBy", "firstName lastName")
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const response: IApiResponse = {
      success: true,
      message: "Vehicles retrieved successfully",
      data: {
        vehicles,
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

// Get available vehicles
export const getAvailableVehicles = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const vehicles = await Vehicle.find({ status: VehicleStatus.AVAILABLE })
      .populate("createdBy", "firstName lastName")
      .sort("-createdAt");

    const response: IApiResponse = {
      success: true,
      message: "Available vehicles retrieved successfully",
      data: { vehicles },
    };

    res.status(200).json(response);
  }
);

// Get vehicle statistics
export const getVehicleStats = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({
      status: VehicleStatus.AVAILABLE,
    });
    const leasedVehicles = await Vehicle.countDocuments({
      status: VehicleStatus.LEASED,
    });
    const maintenanceVehicles = await Vehicle.countDocuments({
      status: VehicleStatus.MAINTENANCE,
    });
    const soldVehicles = await Vehicle.countDocuments({
      status: VehicleStatus.SOLD,
    });
    const reservedVehicles = await Vehicle.countDocuments({
      status: VehicleStatus.RESERVED,
    });

    // Calculate total inventory value
    const inventoryData = await Vehicle.aggregate([
      { $group: { _id: null, totalValue: { $sum: "$purchasePrice" } } },
    ]);

    const totalInventoryValue =
      inventoryData.length > 0 ? inventoryData[0].totalValue : 0;

    // Get vehicle distribution by make
    const makeDistribution = await Vehicle.aggregate([
      { $group: { _id: "$make", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get vehicle distribution by year
    const yearDistribution = await Vehicle.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const response: IApiResponse = {
      success: true,
      message: "Vehicle statistics retrieved successfully",
      data: {
        totalVehicles,
        availableVehicles,
        leasedVehicles,
        maintenanceVehicles,
        soldVehicles,
        reservedVehicles,
        totalInventoryValue,
        makeDistribution,
        yearDistribution,
      },
    };

    res.status(200).json(response);
  }
);

// Get vehicle by ID
export const getVehicleById = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id).populate(
      "createdBy",
      "firstName lastName email"
    );

    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    const response: IApiResponse = {
      success: true,
      message: "Vehicle retrieved successfully",
      data: { vehicle },
    };

    res.status(200).json(response);
  }
);

// Create new vehicle
export const createVehicle = asyncHandler(
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
      make,
      vehicleModel,
      year,
      vin,
      color,
      mileage,
      condition,
      purchasePrice,
      leasePrice,
      images,
      features,
      description,
      location,
    } = req.body;

    // Check if VIN already exists
    const existingVehicle = await Vehicle.findOne({ vin });
    if (existingVehicle) {
      return next(new AppError("Vehicle with this VIN already exists", 400));
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
      make,
      vehicleModel,
      year,
      vin,
      color,
      mileage,
      condition,
      status: VehicleStatus.AVAILABLE,
      purchasePrice,
      leasePrice,
      images: images || [],
      features: features || [],
      description,
      location,
      createdBy: req.user!.userId,
    });

    // Populate the created vehicle
    const populatedVehicle = await Vehicle.findById(vehicle._id).populate(
      "createdBy",
      "firstName lastName"
    );

    const response: IApiResponse = {
      success: true,
      message: "Vehicle created successfully",
      data: { vehicle: populatedVehicle },
    };

    res.status(201).json(response);
  }
);

// Update vehicle
export const updateVehicle = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Check if VIN is being updated and if it already exists
    if (updates.vin && updates.vin !== vehicle.vin) {
      const existingVehicle = await Vehicle.findOne({ vin: updates.vin });
      if (existingVehicle) {
        return next(new AppError("Vehicle with this VIN already exists", 400));
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.updatedAt;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "firstName lastName");

    const response: IApiResponse = {
      success: true,
      message: "Vehicle updated successfully",
      data: { vehicle: updatedVehicle },
    };

    res.status(200).json(response);
  }
);

// Delete vehicle
export const deleteVehicle = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Don't allow deletion of leased or reserved vehicles
    if (
      [VehicleStatus.LEASED, VehicleStatus.RESERVED].includes(vehicle.status)
    ) {
      return next(
        new AppError("Cannot delete leased or reserved vehicles", 400)
      );
    }

    await Vehicle.findByIdAndDelete(id);

    const response: IApiResponse = {
      success: true,
      message: "Vehicle deleted successfully",
    };

    res.status(200).json(response);
  }
);

// Update vehicle status
export const updateVehicleStatus = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(VehicleStatus).includes(status)) {
      return next(new AppError("Invalid vehicle status", 400));
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    vehicle.status = status;
    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(id).populate(
      "createdBy",
      "firstName lastName"
    );

    const response: IApiResponse = {
      success: true,
      message: `Vehicle status updated to ${status}`,
      data: { vehicle: updatedVehicle },
    };

    res.status(200).json(response);
  }
);

// Upload vehicle images
export const uploadVehicleImages = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return next(new AppError("Images array is required", 400));
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Add new images to existing ones
    vehicle.images = [...vehicle.images, ...images];
    await vehicle.save();

    const response: IApiResponse = {
      success: true,
      message: "Vehicle images uploaded successfully",
      data: { vehicle },
    };

    res.status(200).json(response);
  }
);

// Remove vehicle image
export const removeVehicleImage = asyncHandler(
  async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return next(new AppError("Image URL is required", 400));
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError("Vehicle not found", 404));
    }

    // Remove image from array
    vehicle.images = vehicle.images.filter((img) => img !== imageUrl);
    await vehicle.save();

    const response: IApiResponse = {
      success: true,
      message: "Vehicle image removed successfully",
      data: { vehicle },
    };

    res.status(200).json(response);
  }
);
