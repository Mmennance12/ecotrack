const Driver = require("../models/Driver");

const normalizeDriverPayload = (payload) => {
  const vehicleFromLegacy =
    payload.vehicle ||
    (payload.vehicleType || payload.plateNumber
      ? {
          type: payload.vehicleType || payload.vehicle?.type,
          plateNumber: payload.plateNumber || payload.vehicle?.plateNumber,
        }
      : null);

  return {
    ...payload,
    vehicle: vehicleFromLegacy,
  };
};

const addDriver = async (req, res) => {
  try {
    const driver = await Driver.create(normalizeDriverPayload(req.body));
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: "Failed to add driver", error: error.message });
  }
};

const addDriversBulk = async (req, res) => {
  try {
    const payload = Array.isArray(req.body)
      ? req.body.map((driver) => normalizeDriverPayload(driver))
      : [];
    const drivers = await Driver.insertMany(payload);
    res.status(201).json({ message: "Drivers added successfully", data: drivers });
  } catch (error) {
    res.status(500).json({ message: "Failed to add drivers", error: error.message });
  }
};

const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch drivers", error: error.message });
  }
};

module.exports = {
  addDriver,
  addDriversBulk,
  getDrivers,
};
