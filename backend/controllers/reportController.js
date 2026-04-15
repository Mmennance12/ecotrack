const mongoose = require("mongoose");
const WasteReport = require("../models/WasteReport");
const Driver = require("../models/Driver");

const buildQueryFeatures = (req, baseFilter = {}) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { ...baseFilter };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;

  return { filter, page, limit, skip };
};

// ------------------ CITIZEN ------------------

const getMyReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await WasteReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createReport = async (req, res) => {
  try {
    const { wasteType, description, location, priority } = req.body;

    const parsedLocation =
      typeof location === "string" ? JSON.parse(location) : location;

    let imagePath = null;
    if (req.file) imagePath = req.file.path;

    const report = await WasteReport.create({
      wasteType,
      description,
      images: imagePath ? [imagePath] : [],
      location: parsedLocation,
      priority,
      status: "pending",
      createdBy: req.user._id,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getCitizenStats = async (req, res) => {
  try {
    const total = await WasteReport.countDocuments({
      createdBy: req.user._id,
    });

    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ SUPERVISOR ------------------

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (req.user.role !== "supervisor") {
      return res.status(403).json({ message: "Supervisor only" });
    }

    const report = await WasteReport.findById(req.params.id);

    if (!report) return res.status(404).json({ message: "Not found" });

    if (
      report.status === "rejected" ||
      report.status === "government_assigned"
    ) {
      return res.status(400).json({ message: "Finalized report" });
    }

    if (report.status !== "pending") {
      return res.status(400).json({ message: "Only pending allowed" });
    }

    const allowed = ["verified", "government_assigned", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    report.status = status;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getSupervisorStats = async (req, res) => {
  try {
    const total = await WasteReport.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const assignDriverToReport = async (req, res) => {
  try {
    const { id: reportId } = req.params;
    const { driverId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const report = await WasteReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status !== "verified") {
      return res.status(400).json({ message: "Report must be verified before assignment" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    report.status = "assigned";
    report.assignedTo = driver._id;
    await report.save();

    driver.status = "busy";
    driver.assignedReportId = report._id;
    await driver.save();

    res.json({
      report,
      driver: {
        id: driver._id,
        name: driver.name,
        status: driver.status,
        vehicleType: driver.vehicleType,
        plateNumber: driver.plateNumber,
        area: driver.area,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ RECYCLER ------------------

const getVerifiedReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({
      status: "verified",
      assignedTo: null,
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyAssignedReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({
      assignedTo: req.user._id,
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const assignReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    report.status = "assigned";
    report.assignedTo = req.user._id;

    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const startReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    report.status = "in_progress";
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resolveReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    report.status = "resolved";
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------

const getReportById = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReport,
  getVerifiedReports,
  getMyAssignedReports,
  getSupervisorStats,
  assignReport,
  startReport,
  resolveReport,
  getCitizenStats,
  getMyReports,
  getAllReports,
  getReportById,
  updateReportStatus,
  assignDriverToReport,
};