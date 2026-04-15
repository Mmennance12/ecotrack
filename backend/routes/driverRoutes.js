const express = require("express");
const {
  addDriver,
  addDriversBulk,
  getDrivers,
} = require("../controllers/driverController");

const router = express.Router();

router.post("/", addDriver);
router.post("/bulk", addDriversBulk);
router.get("/", getDrivers);

module.exports = router;
