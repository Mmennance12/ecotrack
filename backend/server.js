const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();


const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const pickupRoutes = require("./routes/pickupRoutes");
const driverRoutes = require("./routes/driverRoutes");
const { protect } = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// 🔐 Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/drivers", driverRoutes);


// 🌐 Public Route
app.get("/", (req, res) => {
  res.json({ message: "EcoTrack API running" });
});

// 🔐 Temporary Protected Test Route
app.get("/protected-test", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

// 🔥 MongoDB Connection + Server Start
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

startServer();