/*
  Debug script to verify pickup data and coordinate quality
*/

require("dotenv").config();
const mongoose = require("mongoose");
const Pickup = require("../models/Pickup");

const debug = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI not set in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  try {
    // STEP 1: Count all pickups
    const total = await Pickup.countDocuments();
    console.log(`📊 TOTAL PICKUPS IN DB: ${total}\n`);

    // STEP 2: Show all pickups with full data
    if (total > 0) {
      console.log("═══════════════════════════════════════════════════════════");
      console.log("SAMPLE PICKUPS (first 5):");
      console.log("═══════════════════════════════════════════════════════════\n");

      const samples = await Pickup.find().limit(5).lean();
      samples.forEach((p, i) => {
        console.log(`[${i + 1}] ID: ${p._id}`);
        console.log(`    Waste Type: ${p.wasteType}`);
        console.log(`    Location: ${p.location}`);
        console.log(`    Coordinates: ${JSON.stringify(p.coordinates)}`);
        console.log(`    Status: ${p.status}`);
        console.log(`    Assigned To: ${p.assignedTo || "null"}`);
        console.log(`    Created At: ${p.createdAt}`);
        console.log("");
      });
    }

    // STEP 3: Check for coordinate quality
    console.log("═══════════════════════════════════════════════════════════");
    console.log("COORDINATE QUALITY CHECK:");
    console.log("═══════════════════════════════════════════════════════════\n");

    const withCoords = await Pickup.countDocuments({
      "coordinates.lat": { $exists: true, $ne: null },
      "coordinates.lng": { $exists: true, $ne: null }
    });

    const missingLat = await Pickup.countDocuments({
      $or: [
        { "coordinates.lat": { $exists: false } },
        { "coordinates.lat": null }
      ]
    });

    const missingLng = await Pickup.countDocuments({
      $or: [
        { "coordinates.lng": { $exists: false } },
        { "coordinates.lng": null }
      ]
    });

    console.log(`✅ Pickups WITH valid coordinates: ${withCoords}`);
    console.log(`❌ Pickups MISSING lat: ${missingLat}`);
    console.log(`❌ Pickups MISSING lng: ${missingLng}\n`);

    // STEP 4: Check status distribution
    console.log("═══════════════════════════════════════════════════════════");
    console.log("STATUS DISTRIBUTION:");
    console.log("═══════════════════════════════════════════════════════════\n");

    const statuses = await Pickup.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    statuses.forEach(s => {
      console.log(`${s._id}: ${s.count}`);
    });

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("QUERY FILTER TEST:");
    console.log("═══════════════════════════════════════════════════════════\n");

    // Test the exact filter from controller
    const filtered = await Pickup.find({
      "coordinates.lat": { $type: "number" },
      "coordinates.lng": { $type: "number" }
    });

    console.log(`✅ Pickups returned by $type filter: ${filtered.length}`);
    console.log(`   (Expected: should match "WITH valid coordinates" count above)\n`);

    // Test simple existence check
    const existsFilter = await Pickup.find({
      "coordinates.lat": { $exists: true },
      "coordinates.lng": { $exists: true }
    });

    console.log(`✅ Pickups returned by $exists filter: ${existsFilter.length}\n`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

debug();
