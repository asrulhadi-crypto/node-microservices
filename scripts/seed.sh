#!/bin/bash

# Seed script for populating database with sample data
# Run this after starting the services

set -e

GATEWAY_URL="${GATEWAY_URL:-http://localhost:3000}"

echo "🌱 Seeding database with sample data..."

# Register a test user
echo "📝 Creating test user..."
USER_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }')

echo "$USER_RESPONSE" | jq .

# Extract token for subsequent requests
TOKEN=$(echo "$USER_RESPONSE" | jq -r '.data.token')

# Create some products (as admin - you'll need to manually set role to admin first)
echo ""
echo "📝 Creating sample products..."

# Note: In a real scenario, you'd need admin privileges
# For now, we'll just show the structure

echo ""
echo "✅ Seeding complete!"
echo ""
echo "📚 Test credentials:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "📚 Sample API calls:"
echo "   Login: curl -X POST $GATEWAY_URL/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'"
echo "   Get Products: curl $GATEWAY_URL/api/products"
echo "   Get Profile: curl -H \"Authorization: Bearer $TOKEN\" $GATEWAY_URL/api/users/profile"
