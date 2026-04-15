const jwt = require("jsonwebtoken");
const User = require("../models/User");

//
// 🔐 Verify Token Middleware
//
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    // 🔎 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 Fetch fresh user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "User account is suspended",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};


//
// 🔐 Role-Based Access Middleware
//
const authorize = (...roles) => {
  return (req, res, next) => {

    console.log("🔎 Required Roles:", roles);
    console.log("🔎 User Role:", req.user?.role);

    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = { protect, authorize };