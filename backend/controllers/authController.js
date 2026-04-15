const User = require("../models/User");
const WasteReport = require("../models/WasteReport");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//
// 🔧 Pagination Utility
//
const buildPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

//
// 🔐 Register User
//
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    let assignedRole = "citizen";

    if (role === "recycler") {
      assignedRole = "recycler";
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "citizen",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// 🔐 Login User
//
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Account suspended",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// 🛡 ADMIN: Get All Users (Paginated)
//
const getAllUsers = async (req, res) => {
  try {
    const { page, limit, skip } = buildPagination(req);

    const total = await User.countDocuments();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      results: users.length,
      data: users,
    });

  } catch (error) {
    console.error("Get All Users Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// 🛡 ADMIN: Change User Role
//
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const allowedRoles = ["citizen", "recycler", "supervisor", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Update Role Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// 🛡 ADMIN: Suspend / Activate User
//
const toggleUserStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "suspended"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error("Toggle User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// 🔥 FIXED: Get current logged-in user
//
const getMe = async (req, res) => {
  try {
    // 🔥 IMPORTANT FIX: fetch full user from DB
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user, // ✅ matches frontend expectation
    });

  } catch (error) {
    console.error("GetMe Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//
// 🔧 Update current user
//
const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: updatedUser, // ✅ consistent response
    });

  } catch (error) {
    console.error("UpdateMe Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getMe,
  updateMe,
};