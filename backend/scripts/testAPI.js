/*
  Test API endpoints with actual data
*/

require("dotenv").config({ path: "/home/mmennancemuhia/citizen-centric/backend/.env" });
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../models/User");

const API_BASE = "http://localhost:5000/api";

const test = async () => {
  console.log("============================================================");
  console.log("ECOTRACK PICKUP API TEST");
  console.log("============================================================\n");

  // Step 1: Create or find a test recycler user
  console.log("STEP 1: Getting/Creating test recycler user...\n");
  
  await mongoose.connect(process.env.MONGO_URI);
  
  let testUser = await User.findOne({ email: "test.recycler@test.com" });
  
  if (!testUser) {
    testUser = new User({
      name: "Test Recycler",
      email: "test.recycler@test.com",
      password: "hashed_password_here", // In real scenario, this would be hashed
      role: "recycler",
      phone: "0700000000",
      location: { lat: -1.28, lng: 36.81 }
    });
    await testUser.save();
    console.log("✅ Created test user");
  } else {
    console.log("✅ Found existing test user");
  }
  
  const userId = testUser._id;
  console.log(`   User ID: ${userId}\n`);

  // Step 2: Login to get JWT
  console.log("STEP 2: Logging in to get JWT...\n");
  
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "test.recycler@test.com",
      password: "password123" // Frontend would use the password they set
    });
    
    console.log("❌ Login succeeded (but password might be wrong)");
    console.log(`   Token: ${loginRes.data.token}\n`);
  } catch (err) {
    // Expected to fail since we don't have the real hashed password
    console.log("⚠️  Login failed (expected - we need to bypass auth)\n");
  }

  // Step 3: Test API directly without auth since we're debugging
  console.log("STEP 3: Testing API (skipping auth for debug)...\n");
  
  try {
    // First, let's check if the server is running
    const healthRes = await axios.get("http://localhost:5000/");
    console.log("✅ Server is running!");
    console.log(`   Response: ${healthRes.data.message}\n`);
  } catch (err) {
    console.log("❌ Server is NOT responding at localhost:5000");
    console.log(`   Error: ${err.message}\n`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Step 4: Get pickups (we'll need to create a token manually for testing)
  console.log("STEP 4: Creating test JWT token...\n");
  
  const jwt = require("jsonwebtoken");
  const token = jwt.sign(
    { _id: userId, role: "recycler" },
    process.env.JWT_SECRET || "supersecretkey123",
    { expiresIn: "1h" }
  );
  
  console.log(`✅ Created test token\n`);

  // Step 5: Fetch pickups
  console.log("STEP 5: Fetching pickups...\n");
  
  try {
    const pickupsRes = await axios.get(`${API_BASE}/pickups`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ PICKUPS API RETURNED DATA!`);
    console.log(`   Count: ${pickupsRes.data.length}`);
    console.log(`   Data:\n${JSON.stringify(pickupsRes.data, null, 2)}\n`);
  } catch (err) {
    console.log(`❌ PICKUPS API FAILED`);
    console.log(`   Status: ${err.response?.status}`);
    console.log(`   Message: ${err.response?.data?.message || err.message}\n`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

test().catch(err => {
  console.error("❌ Test error:", err.message);
  process.exit(1);
});
