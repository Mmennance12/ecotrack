/*
  One-time migration script:
  - Finds WasteReport documents with status 'verified'
  - Creates corresponding Pickup documents (status: 'available')
  - Skips reports already migrated (checks sourceReport)

  Run from backend folder:
    node scripts/migrateReportsToPickups.js
*/

require("dotenv").config();
const mongoose = require("mongoose");
const WasteReport = require("../models/WasteReport");
const Pickup = require("../models/Pickup");

const migrate = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const reports = await WasteReport.find({ status: "verified" });

    console.log(`Found ${reports.length} verified reports`);

    let created = 0;
    for (const r of reports) {
      // skip if a pickup already references this report
      const exists = await Pickup.findOne({ sourceReport: r._id });
      if (exists) continue;

      // ensure coordinates exist
      if (!r.location || typeof r.location.latitude !== "number" || typeof r.location.longitude !== "number") {
        console.warn(`Skipping report ${r._id} — missing coordinates`);
        continue;
      }

      const pickup = new Pickup({
        wasteType: r.wasteType || "Unknown",
        description: r.description || "",
        location: r.location.address || "",
        coordinates: { lat: r.location.latitude, lng: r.location.longitude },
        status: "available",
        assignedTo: null,
        sourceReport: r._id,
      });

      // preserve createdAt from the report where possible
      if (r.createdAt) pickup.createdAt = r.createdAt;

      await pickup.save();
      created += 1;
    }

    console.log(`Migration complete. Created ${created} pickups.`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
