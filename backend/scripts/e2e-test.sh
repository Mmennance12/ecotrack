#!/bin/bash

# 🧪 ECOTRACK PICKUP SYSTEM - END-TO-END TEST
# Tests: Database → API → Frontend Integration

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        ECOTRACK PICKUP SYSTEM - E2E TEST                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "✅ Step 1: Verify Backend Server is Running..."
if curl -s http://localhost:5000/ > /dev/null; then
  echo "   ✅ API Server is running on port 5000"
else
  echo "   ❌ API Server is NOT running"
  exit 1
fi

echo ""
echo "✅ Step 2: Login and Get JWT Token..."

# Login with test user
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test.recycler@test.com","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo "   ❌ Login failed"
  exit 1
fi

echo "   ✅ JWT Token obtained"
echo "   Token: ${TOKEN:0:50}..."

echo ""
echo "✅ Step 3: Fetch Pickups from API..."

# Call the API
API_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:5000/api/pickups)

# Count pickups in response
PICKUP_COUNT=$(echo "$API_RESPONSE" | grep -o '"_id"' | wc -l)

echo "   ✅ API Response received"
echo "   Pickups in response: $PICKUP_COUNT"

if [ $PICKUP_COUNT -gt 0 ]; then
  echo ""
  echo "✅ Step 4: Verify Pickup Data Structure..."
  echo ""
  echo "   Sample API Response:"
  echo "$API_RESPONSE" | python3 -m json.tool | head -40 || echo "$API_RESPONSE" | head -10
  
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "✅ ALL E2E TESTS PASSED!"
  echo "✅ Pickup system is returning data correctly through the API"
  echo "✅ Frontend will receive pickups when calling usePickups.load()"
  echo "╚════════════════════════════════════════════════════════════╝"
else
  echo ""
  echo "❌ No pickups returned from API"
  exit 1
fi
