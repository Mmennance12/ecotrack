const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    vehicle: {
      plateNumber: { type: String, required: true },
      type: { type: String, required: true },
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
    },
    vehicleType: { type: String },
    plateNumber: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] },
    },
    status: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
    assignedReportId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    area: { type: String },
  },
  { timestamps: true }
);

driverSchema.index({ location: "2dsphere" });

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
