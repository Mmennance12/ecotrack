const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getPickups,
  assignPickup,
  completePickup,
  getPickupById,
} = require("../controllers/pickupController");

// List pickups (supports ?status=available|assigned|completed and assignedTo=me)
router.get("/", protect, authorize("recycler", "supervisor", "citizen"), getPickups);

// Get single pickup
router.get("/:id", protect, authorize("recycler", "supervisor", "citizen"), getPickupById);

// Assign pickup to self (recycler)
router.patch("/:id/assign", protect, authorize("recycler"), assignPickup);

// Complete pickup (recycler)
router.patch("/:id/complete", protect, authorize("recycler"), completePickup);

module.exports = router;
