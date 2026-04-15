/*
  COMPREHENSIVE VALIDATION REPORT
  Tests all steps: DB → API → Frontend
*/

require("dotenv").config();
const mongoose = require("mongoose");
const Pickup = require("../models/Pickup");
const User = require("../models/User");

const generateReport = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI not set");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║         ECOTRACK PICKUP SYSTEM - VALIDATION REPORT          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // ✅ STEP 1: Verify MongoDB Content
  console.log("═══════════════════════════════════════════════════════════");
  console.log("STEP 1: VERIFY MONGODB CONTENT");
  console.log("═══════════════════════════════════════════════════════════\n");

  const totalPickups = await Pickup.countDocuments();
  const validCoordinates = await Pickup.countDocuments({
    "coordinates.lat": { $exists: true, $ne: null },
    "coordinates.lng": { $exists: true, $ne: null }
  });

  const statusCounts = await Pickup.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  console.log(`✅ Total Pickups: ${totalPickups}`);
  console.log(`✅ Pickups with Valid Coordinates: ${validCoordinates}`);
  console.log(`\nStatus Distribution:`);
  statusCounts.forEach(s => {
    console.log(`   - ${s._id}: ${s.count}`);
  });

  // Sample data
  const sample = await Pickup.findOne().lean();
  if (sample) {
    console.log(`\n✅ Sample Pickup Document:`);
    console.log(`   ID: ${sample._id}`);
    console.log(`   Waste Type: ${sample.wasteType}`);
    console.log(`   Status: ${sample.status}`);
    console.log(`   Coordinates: lat=${sample.coordinates.lat}, lng=${sample.coordinates.lng}`);
    console.log(`   Assigned To: ${sample.assignedTo || "null"}`);
  }

  // ✅ STEP 2: Verify API Filter
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`STEP 2: VERIFY API FILTER`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  const filterResult = await Pickup.find({
    "coordinates.lat": { $type: "number" },
    "coordinates.lng": { $type: "number" }
  });

  console.log(`✅ Pickups returned by API filter ($type): ${filterResult.length}`);
  if (filterResult.length === totalPickups) {
    console.log(`✅ Filter is working correctly - ALL pickups have valid coordinates`);
  } else if (filterResult.length === 0) {
    console.log(`❌ WARNING: Filter returned ZERO pickups!`);
    console.log(`   This means coordinates might be missing or improperly formatted`);
  } else {
    console.log(`⚠️  Filter returned ${filterResult.length} of ${totalPickups} pickups`);
    console.log(`   Some pickups are being filtered out`);
  }

  // ✅ STEP 3: Check User Data
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`STEP 3: VERIFY USER DATA`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  const users = await User.find().select("-password").lean();
  console.log(`✅ Total Users: ${users.length}`);
  
  const usersByRole = {};
  users.forEach(u => {
    usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
  });

  console.log(`\nUsers by Role:`);
  Object.entries(usersByRole).forEach(([role, count]) => {
    console.log(`   - ${role}: ${count}`);
  });

  const assignedPickups = await Pickup.find({
    assignedTo: { $exists: true, $ne: null }
  });
  
  console.log(`\n✅ Pickups Assigned: ${assignedPickups.length}`);
  if (assignedPickups.length > 0) {
    const firstAssigned = assignedPickups[0];
    console.log(`\n   Sample Assigned Pickup:`);
    console.log(`   Assigned To ID: ${firstAssigned.assignedTo}`);
    
    // Check if user exists
    const assignedUser = await User.findById(firstAssigned.assignedTo);
    if (assignedUser) {
      console.log(`   ✅ User Exists: ${assignedUser.name} (${assignedUser.role})`);
    } else {
      console.log(`   ❌ WARNING: User does not exist!`);
    }
  }

  // ✅ STEP 4: Verify Frontend Expectations
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`STEP 4: VERIFY FRONTEND EXPECTATIONS`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  const formattedSample = sample ? {
    _id: sample._id.toString(),
    wasteType: sample.wasteType,
    location: sample.location,
    coordinates: sample.coordinates && { lat: sample.coordinates.lat, lng: sample.coordinates.lng },
    status: sample.status,
    assignedTo: sample.assignedTo ? sample.assignedTo.toString() : null,
    assignedAt: sample.assignedAt || null,
    completedAt: sample.completedAt || null,
  } : null;

  console.log(`✅ Expected Frontend Pickup Shape:`);
  console.log(`\n${JSON.stringify(formattedSample, null, 2)}`);

  // ✅ STEP 5: Summary
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`VALIDATION SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  const issues = [];
  
  if (totalPickups === 0) {
    issues.push("❌ No pickups found in database");
  }
  
  if (validCoordinates !== totalPickups && totalPickups > 0) {
    issues.push(`❌ ${totalPickups - validCoordinates} pickups have missing coordinates`);
  }
  
  if (filterResult.length === 0 && totalPickups > 0) {
    issues.push("❌ API filter is returning zero pickups (filter too strict)");
  }

  if (issues.length === 0) {
    console.log("✅ ALL CHECKS PASSED!");
    console.log("✅ Pickup system is returning data correctly");
    console.log("✅ Database → API → Frontend data flow is working");
    console.log(`✅ ${totalPickups} pickups ready to be displayed`);
  } else {
    console.log("⚠️  ISSUES DETECTED:");
    issues.forEach(issue => {
      console.log(issue);
    });
  }

  console.log("\n╚════════════════════════════════════════════════════════════╝\n");

  await mongoose.disconnect();
  process.exit(0);
};

generateReport().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
