import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Vehicle from "../models/Vehicle";
import { UserRole, VehicleStatus } from "../types";

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create test users for each role
    const testUsers = [
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@ltocms.com",
        password: "Admin123!",
        role: UserRole.ADMIN,
        phone: "+1234567890",
        address: {
          street: "123 Admin Street",
          city: "Admin City",
          state: "AC",
          zipCode: "12345",
          country: "USA",
        },
        isEmailVerified: true,
        isActive: true,
      },
      {
        firstName: "Sales",
        lastName: "Representative",
        email: "sales@ltocms.com",
        password: "Sales123!",
        role: UserRole.SALES_ADMIN,
        phone: "+1234567891",
        address: {
          street: "456 Sales Avenue",
          city: "Sales City",
          state: "SC",
          zipCode: "12345",
          country: "USA",
        },
        isEmailVerified: true,
        isActive: true,
      },
      {
        firstName: "Credit",
        lastName: "Analyst",
        email: "credit@ltocms.com",
        password: "Credit123!",
        role: UserRole.CREDIT_STAFF,
        phone: "+1234567892",
        address: {
          street: "789 Credit Boulevard",
          city: "Credit City",
          state: "CC",
          zipCode: "12345",
          country: "USA",
        },
        isEmailVerified: true,
        isActive: true,
      },
      {
        firstName: "John",
        lastName: "Client",
        email: "client@ltocms.com",
        password: "Client123!",
        role: UserRole.CLIENT,
        phone: "+1234567893",
        address: {
          street: "321 Client Road",
          city: "Client City",
          state: "CL",
          zipCode: "12345",
          country: "USA",
        },
        isEmailVerified: true,
        isActive: true,
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "Client123!",
        role: UserRole.CLIENT,
        phone: "+1234567894",
        address: {
          street: "654 Example Street",
          city: "Example City",
          state: "EX",
          zipCode: "12345",
          country: "USA",
        },
        isEmailVerified: true,
        isActive: true,
      },
    ];

    // Insert test users
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created ${userData.role} user: ${userData.email}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    // Get admin user for vehicle creation
    const adminUser = await User.findOne({ email: "admin@ltocms.com" });
    if (!adminUser) {
      console.log("⚠️  Admin user not found, skipping vehicle creation");
    } else {
      // Create sample vehicles
      const sampleVehicles = [
        {
          make: "Toyota",
          vehicleModel: "Camry",
          year: 2023,
          vin: "1HGBH41JXMN109186",
          color: "Silver",
          mileage: 15000,
          condition: "excellent",
          purchasePrice: 28000,
          leasePrice: 32000,
          status: VehicleStatus.AVAILABLE,
          features: ["Bluetooth", "Backup Camera", "Cruise Control"],
          description:
            "Reliable and fuel-efficient sedan perfect for daily commuting.",
          location: "Main Lot - A1",
          createdBy: adminUser._id,
          images: [],
        },
        {
          make: "Honda",
          vehicleModel: "CR-V",
          year: 2023,
          vin: "2HGBH41JXMN109187",
          color: "Blue",
          mileage: 8000,
          condition: "excellent",
          purchasePrice: 32000,
          leasePrice: 36000,
          status: VehicleStatus.AVAILABLE,
          features: ["AWD", "Sunroof", "Apple CarPlay", "Android Auto"],
          description:
            "Spacious SUV with excellent safety ratings and modern features.",
          location: "Main Lot - A2",
          createdBy: adminUser._id,
          images: [],
        },
        {
          make: "Ford",
          vehicleModel: "F-150",
          year: 2022,
          vin: "3HGBH41JXMN109188",
          color: "Red",
          mileage: 25000,
          condition: "good",
          purchasePrice: 35000,
          leasePrice: 40000,
          status: VehicleStatus.AVAILABLE,
          features: ["4WD", "Towing Package", "Bed Liner"],
          description: "Powerful pickup truck ideal for work and recreation.",
          location: "Main Lot - B1",
          createdBy: adminUser._id,
          images: [],
        },
        {
          make: "Nissan",
          vehicleModel: "Altima",
          year: 2023,
          vin: "4HGBH41JXMN109189",
          color: "White",
          mileage: 12000,
          condition: "excellent",
          purchasePrice: 26000,
          leasePrice: 30000,
          status: VehicleStatus.LEASED,
          features: ["Navigation", "Heated Seats", "Remote Start"],
          description: "Comfortable sedan with advanced technology features.",
          location: "Client Location",
          createdBy: adminUser._id,
          images: [],
        },
        {
          make: "Chevrolet",
          vehicleModel: "Equinox",
          year: 2023,
          vin: "5HGBH41JXMN109190",
          color: "Black",
          mileage: 5000,
          condition: "excellent",
          purchasePrice: 30000,
          leasePrice: 34000,
          status: VehicleStatus.MAINTENANCE,
          features: ["Leather Seats", "Panoramic Sunroof", "Wireless Charging"],
          description:
            "Stylish SUV with premium interior and cutting-edge technology.",
          location: "Service Bay 1",
          createdBy: adminUser._id,
          images: [],
        },
      ];

      // Insert sample vehicles
      for (const vehicleData of sampleVehicles) {
        const existingVehicle = await Vehicle.findOne({ vin: vehicleData.vin });
        if (!existingVehicle) {
          await Vehicle.create(vehicleData);
          console.log(
            `✅ Created vehicle: ${vehicleData.year} ${vehicleData.make} ${vehicleData.vehicleModel}`
          );
        } else {
          console.log(`⚠️  Vehicle already exists: ${vehicleData.vin}`);
        }
      }
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Test User Accounts Created:");
    console.log("👑 Admin: admin@ltocms.com / Admin123!");
    console.log("💼 Sales: sales@ltocms.com / Sales123!");
    console.log("📊 Credit: credit@ltocms.com / Credit123!");
    console.log("👤 Client: client@ltocms.com / Client123!");
    console.log("👤 Client 2: jane.smith@example.com / Client123!");
    console.log(
      "\n🚗 Sample Vehicles Created: 5 vehicles with various statuses"
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
