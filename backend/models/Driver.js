const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    vehicleType: { type: String, required: true },
    plateNumber: { type: String, required: true },
    phone: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true },
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
