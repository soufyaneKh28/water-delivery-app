#!/bin/bash

# FCM Credentials Setup Script for Expo Push Notifications
# This script guides you through setting up FCM credentials for Android push notifications

echo "=================================================="
echo "FCM Credentials Setup for Expo Push Notifications"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Download FCM Service Account Key${NC}"
echo "----------------------------------------"
echo "1. Go to: https://console.firebase.google.com/"
echo "2. Select project: miaahaljunaidi"
echo "3. Click gear icon (⚙️) → Project settings"
echo "4. Go to 'Service accounts' tab"
echo "5. Click 'Generate new private key'"
echo "6. Click 'Generate key' to download the JSON file"
echo ""
read -p "Press Enter when you have downloaded the service account key file..."
echo ""

echo -e "${YELLOW}Step 2: Install EAS CLI (if not already installed)${NC}"
echo "----------------------------------------"
if command -v eas &> /dev/null; then
    echo -e "${GREEN}✓ EAS CLI is already installed${NC}"
    eas --version
else
    echo -e "${BLUE}Installing EAS CLI...${NC}"
    npm install -g eas-cli
fi
echo ""

echo -e "${YELLOW}Step 3: Login to Expo${NC}"
echo "----------------------------------------"
echo -e "${BLUE}Logging in to Expo...${NC}"
eas login
echo ""

echo -e "${YELLOW}Step 4: Upload FCM Credentials${NC}"
echo "----------------------------------------"
echo "You will be prompted to:"
echo "  1. Select platform: Choose 'Android'"
echo "  2. Select build profile: Choose 'production' (or your preferred profile)"
echo "  3. Select credential: Choose 'Google Service Account'"
echo "  4. Upload the service account key JSON file you downloaded"
echo ""
read -p "Press Enter to start the credentials upload process..."
echo ""

eas credentials

echo ""
echo -e "${GREEN}=================================================="
echo "Setup Complete!"
echo "==================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test push notifications at: https://expo.dev/notifications"
echo "2. Enter your Expo push token from the app"
echo "3. Fill in the message details"
echo "4. Send the notification!"
echo ""
echo "For more details, see: FCM_CREDENTIALS_SETUP_GUIDE.md"
echo ""


