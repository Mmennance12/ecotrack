const mongoose = require("mongoose");

const coordinatesSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const pickupSchema = new mongoose.Schema(
  {
    wasteType: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String },
    coordinates: { type: coordinatesSchema, required: true },
    status: {
      type: String,
      enum: ["available", "assigned", "completed"],
      default: "available",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
      // optional reference to originating WasteReport (for traceability / migration)
      sourceReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WasteReport",
        default: null,
      },
      assignedAt: {
        type: Date,
        default: null,
      },
      completedAt: {
        type: Date,
        default: null,
      },
  },
  { timestamps: true }
);

// Indexes for expected queries
pickupSchema.index({ status: 1 });
pickupSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Pickup", pickupSchema);
