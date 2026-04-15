const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const {
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
  updateReportStatus, // ✅ NEW (IMPORTANT)
  assignDriverToReport,
} = require("../controllers/reportController");

const { protect, authorize } = require("../middleware/authMiddleware");

//
// ======================
// 📝 CITIZEN ROUTES
// ======================
//

// Create waste report
router.post(
  "/",
  protect,
  authorize("citizen"),
  upload.single("image"),
  createReport
);

// Citizen stats
router.get(
  "/stats",
  protect,
  authorize("citizen"),
  getCitizenStats
);

// My reports
router.get(
  "/my",
  protect,
  authorize("citizen"),
  getMyReports
);

// Get all reports (map + supervisor view)
router.get(
  "/",
  protect,
  authorize("citizen", "recycler", "supervisor"),
  getAllReports
);

//
// ======================
// 🛡 SUPERVISOR ROUTES
// ======================
//

// Supervisor stats
router.get(
  "/stats/supervisor",
  protect,
  authorize("supervisor"),
  getSupervisorStats
);

// 🔥 NEW: Unified decision route (REPLACES verify)
router.put(
  "/:id/status",
  protect,
  authorize("supervisor"),
  updateReportStatus
);

// Assign driver to report (supervisor)
router.patch(
  "/:id/assign-driver",
  protect,
  authorize("supervisor"),
  assignDriverToReport
);

//
// ======================
// 🚛 RECYCLER ROUTES
// ======================
//

// View verified reports
router.get(
  "/verified",
  protect,
  authorize("recycler"),
  getVerifiedReports
);

// Recycler assigned reports
router.get(
  "/my-assigned",
  protect,
  authorize("recycler"),
  getMyAssignedReports
);

// Assign to self
router.put(
  "/:id/assign",
  protect,
  authorize("recycler"),
  assignReport
);

// Start work
router.put(
  "/:id/start",
  protect,
  authorize("recycler"),
  startReport
);

// Resolve
router.put(
  "/:id/resolve",
  protect,
  authorize("recycler"),
  resolveReport
);

//
// ======================
// 🔥 SINGLE REPORT ROUTE (ALWAYS LAST)
// ======================
//

router.get(
  "/:id",
  protect,
  authorize("citizen", "recycler", "supervisor"),
  getReportById
);

module.exports = router;