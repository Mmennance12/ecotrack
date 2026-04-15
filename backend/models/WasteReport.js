const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  from: String,
  to: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const wasteReportSchema = new mongoose.Schema(
  {
    wasteType: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
      },
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "verified",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
      ],
      default: "pending",
    },

    // 🔥 NEW: Admin-level archival control
    isArchived: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: Date,
    rejectedAt: Date,

    auditLogs: [auditLogSchema],
  },
  { timestamps: true }
);

// 🔥 Indexes for performance
wasteReportSchema.index({ status: 1 });
wasteReportSchema.index({ assignedTo: 1 });
wasteReportSchema.index({ createdAt: -1 });
wasteReportSchema.index({ priority: 1 });
wasteReportSchema.index({ isArchived: 1 });

module.exports = mongoose.model("WasteReport", wasteReportSchema);