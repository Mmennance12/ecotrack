const mongoose = require("mongoose");
const Pickup = require("../models/Pickup");

const formatPickup = (p) => ({
  _id: p._id,
  wasteType: p.wasteType,
  location: p.location,
  coordinates: p.coordinates && { lat: p.coordinates.lat, lng: p.coordinates.lng },
  status: p.status,
  assignedTo: p.assignedTo ? p.assignedTo.toString() : null,
  assignedAt: p.assignedAt || null,
  completedAt: p.completedAt || null,
});

// GET /pickups?status=available
// optional query: assignedTo=me -> returns pickups assigned to requesting user
const getPickups = async (req, res) => {
  try {
    const filter = {};

    // enforce returning only pickups with valid coordinates for map readiness
    filter["coordinates.lat"] = { $type: "number" };
    filter["coordinates.lng"] = { $type: "number" };

    if (req.query.status) filter.status = req.query.status;

    if (req.query.assignedTo === "me") {
      filter.assignedTo = req.user._id;
    } else if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }

    const pickups = await Pickup.find(filter).sort({ createdAt: -1 });

    res.json(pickups.map(formatPickup));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /pickups/:id/assign
// Assigns an available pickup to the requesting recycler
const assignPickup = async (req, res) => {
  try {
    const id = req.params.id;

    // validate id format early
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid pickup id" });
    }

    // Atomic find-and-update to avoid race conditions
    const condition = {
      _id: id,
      status: "available",
      "coordinates.lat": { $type: "number" },
      "coordinates.lng": { $type: "number" },
    };

    const update = {
      $set: {
        status: "assigned",
        assignedTo: req.user._id,
        assignedAt: new Date(),
      },
    };

    const options = { new: true };

    const updated = await Pickup.findOneAndUpdate(condition, update, options);

    if (!updated) {
      // Could be already assigned or missing coordinates
      return res.status(409).json({ message: "Pickup already assigned" });
    }

    res.json(formatPickup(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /pickups/:id/complete
// Marks an assigned pickup as completed
const completePickup = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Not found" });

    if (pickup.status === "completed") {
      return res.status(400).json({ message: "Pickup already completed" });
    }

    if (pickup.status !== "assigned") {
      return res.status(400).json({ message: "Only assigned pickups can be completed" });
    }

    // ensure only assigned recycler can complete
    if (!pickup.assignedTo || pickup.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this pickup" });
    }

    pickup.status = "completed";
    pickup.completedAt = new Date();
    await pickup.save();

    res.json(formatPickup(pickup));
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid pickup id" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// GET /pickups/:id
const getPickupById = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Not found" });
    // ensure coordinates are valid before returning
    if (
      !pickup.coordinates ||
      typeof pickup.coordinates.lat !== "number" ||
      typeof pickup.coordinates.lng !== "number"
    ) {
      return res.status(400).json({ message: "Pickup missing valid coordinates" });
    }
    res.json(formatPickup(pickup));
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid pickup id" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPickups,
  assignPickup,
  completePickup,
  getPickupById,
};
