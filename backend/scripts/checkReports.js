/*
  Check if WasteReports exist and can be migrated to Pickups
*/

require("dotenv").config();
const mongoose = require("mongoose");
const WasteReport = require("../models/WasteReport");
const Pickup = require("../models/Pickup");

const check = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI not set");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  try {
    const totalReports = await WasteReport.countDocuments();
    const verifiedReports = await WasteReport.countDocuments({ status: "verified" });
    
    console.log("═══════════════════════════════════════════════════════════");
    console.log("WASTE REPORTS STATUS:");
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log(`Total WasteReports: ${totalReports}`);
    console.log(`Verified Reports (eligible for migration): ${verifiedReports}\n`);

    if (verifiedReports > 0) {
      console.log("SAMPLE VERIFIED REPORTS (first 3):\n");
      const samples = await WasteReport.find({ status: "verified" }).limit(3).lean();
      
      samples.forEach((r, i) => {
        console.log(`[${i + 1}] ID: ${r._id}`);
        console.log(`    Waste Type: ${r.wasteType}`);
        console.log(`    Status: ${r.status}`);
        console.log(`    Location: ${JSON.stringify(r.location)}`);
        console.log(`    Has Coordinates: ${r.location && typeof r.location.latitude === 'number' && typeof r.location.longitude === 'number' ? '✅' : '❌'}`);
        console.log("");
      });

      console.log("═══════════════════════════════════════════════════════════");
      console.log("⚠️  YOU SHOULD RUN:");
      console.log("   npm run migrate:reports-to-pickups");
      console.log("═══════════════════════════════════════════════════════════\n");
    } else {
      console.log("⚠️  No verified reports found to migrate.\n");
      console.log("📌 Option 1: Create some WasteReports first");
      console.log("📌 Option 2: Seed test data directly to Pickups collection\n");
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

check();
