#!/bin/bash

# AprilTag Detector Mobile - Setup Script
# This script sets up the project for first-time use

set -e

echo "🎯 AprilTag Detector Mobile - Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} installed${NC}"
echo ""

# Check if expo-cli is installed globally
echo "🔍 Checking for Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}⚠ Expo CLI not found. Installing globally...${NC}"
    npm install -g expo-cli
    echo -e "${GREEN}✓ Expo CLI installed${NC}"
else
    EXPO_VERSION=$(expo --version)
    echo -e "${GREEN}✓ Expo CLI ${EXPO_VERSION} installed${NC}"
fi
echo ""

# Install project dependencies
echo "📥 Installing project dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Create basic placeholder assets if they don't exist
echo "🎨 Setting up placeholder assets..."
if [ ! -d "assets" ]; then
    mkdir -p assets
fi

# Create simple placeholder images using ImageMagick if available
if command -v convert &> /dev/null; then
    echo "Creating placeholder icons with ImageMagick..."
    
    # Icon (1024x1024)
    if [ ! -f "assets/icon.png" ]; then
        convert -size 1024x1024 xc:#4A90E2 -gravity center \
            -pointsize 200 -fill white -annotate +0+0 "AT" \
            assets/icon.png 2>/dev/null || touch assets/icon.png.placeholder
    fi
    
    # Splash (1284x2778)
    if [ ! -f "assets/splash.png" ]; then
        convert -size 1284x2778 xc:#4A90E2 -gravity center \
            -pointsize 100 -fill white -annotate +0-200 "AprilTag" \
            -pointsize 80 -annotate +0+100 "Detector" \
            assets/splash.png 2>/dev/null || touch assets/splash.png.placeholder
    fi
    
    # Adaptive Icon (1024x1024)
    if [ ! -f "assets/adaptive-icon.png" ]; then
        cp assets/icon.png assets/adaptive-icon.png 2>/dev/null || touch assets/adaptive-icon.png.placeholder
    fi
    
    # Favicon (48x48)
    if [ ! -f "assets/favicon.png" ]; then
        convert -size 48x48 xc:#4A90E2 -gravity center \
            -pointsize 24 -fill white -annotate +0+0 "AT" \
            assets/favicon.png 2>/dev/null || touch assets/favicon.png.placeholder
    fi
    
    echo -e "${GREEN}✓ Placeholder assets created${NC}"
else
    echo -e "${YELLOW}⚠ ImageMagick not found. Please create assets manually.${NC}"
    echo "  Required assets:"
    echo "    - assets/icon.png (1024x1024)"
    echo "    - assets/splash.png (1284x2778)"
    echo "    - assets/adaptive-icon.png (1024x1024)"
    echo "    - assets/favicon.png (48x48)"
fi
echo ""

# Print success message and next steps
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start the development server:"
echo -e "     ${YELLOW}npm start${NC}"
echo ""
echo "  2. Install Expo Go on your phone:"
echo "     📱 iOS: App Store"
echo "     📱 Android: Google Play Store"
echo ""
echo "  3. Scan the QR code to open the app"
echo ""
echo "  4. Test with AprilTags from:"
echo "     https://github.com/AprilRobotics/apriltag-imgs"
echo ""
echo "📚 Documentation:"
echo "  • Quick Start: QUICKSTART.md"
echo "  • Full Guide: README-MOBILE.md"
echo "  • Production: PRODUCTION-SETUP.md"
echo ""
echo -e "${GREEN}Happy coding! 🎯${NC}"
