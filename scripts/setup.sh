#!/bin/bash

# Setup script for Node.js Microservices
# This script installs dependencies and sets up the development environment

set -e

echo "🚀 Setting up Node.js Microservices..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

echo "📦 Checking Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing root dependencies..."
npm install

# Install shared package
echo "📦 Installing shared package..."
npm install --workspace=packages/shared

# Install all services
echo "📦 Installing service dependencies..."
npm install --workspace=services/api-gateway
npm install --workspace=services/user-service
npm install --workspace=services/product-service
npm install --workspace=services/order-service

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Review and update .env file with your configuration"
echo "   2. Run 'npm run docker:up' to start all services with Docker"
echo "   3. Or run 'npm run dev' to start services locally"
echo ""
echo "📖 API Gateway will be available at: http://localhost:3000"
echo "📖 Health check: http://localhost:3000/health"
