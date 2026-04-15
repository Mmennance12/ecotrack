const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getMe,
  updateMe, // ✅ ADD THIS
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/authMiddleware");

//
// ======================
// 🔐 PUBLIC ROUTES
// ======================
//

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get current logged-in user
router.get("/me", protect, getMe);

// Update current logged-in user ✅ ADD THIS
router.put("/me", protect, updateMe);

//
// ======================
// 🛡 ADMIN ROUTES
// ======================
//

// Get all users (paginated)
router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers
);

// Change user role
router.put(
  "/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole
);

// Suspend / Activate user
router.put(
  "/users/:id/toggle-status",
  protect,
  authorize("admin"),
  toggleUserStatus
);

// Create supervisor
router.post(
  "/users/create-supervisor",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const User = require("../models/User");

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const supervisor = await User.create({
        name,
        email,
        password,
        role: "supervisor",
      });

      res.status(201).json({
        message: "Supervisor created successfully",
        user: supervisor,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;