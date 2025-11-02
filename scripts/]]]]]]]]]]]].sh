#!/bin/bash

# Script to fix Android notifications after package name change
# This guides you through re-uploading FCM credentials to Expo

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================================${NC}"
echo -e "${MAGENTA}   Fix Android Notifications After Package Name Change${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

echo -e "${YELLOW}Current Configuration:${NC}"
echo -e "  iOS Package:     ${GREEN}com.aljunaidiwater.app${NC} (Working ✅)"
echo -e "  Android Package: ${GREEN}com.miaahaljunaidi.app${NC} (Needs Fix ⚠️)"
echo -e "  Firebase Project: ${GREEN}miaahaljunaidi${NC}"
echo ""

echo -e "${RED}Important: The FCM credentials in Expo are for the OLD package name!${NC}"
echo -e "${RED}You need to re-upload them for the NEW package name.${NC}"
echo ""

# Step 1
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1: Download New Service Account Key${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Open: https://console.firebase.google.com/"
echo "2. Select project: miaahaljunaidi"
echo "3. Click ⚙️  → Project settings"
echo "4. Go to 'Service accounts' tab"
echo "5. Click 'Generate new private key'"
echo "6. Download the JSON file"
echo ""
read -p "Press Enter when you have downloaded the service account key..."
echo ""

# Step 2
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 2: Check EAS CLI Installation${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""

if command -v eas &> /dev/null; then
    echo -e "${GREEN}✓ EAS CLI is installed${NC}"
    eas --version
else
    echo -e "${YELLOW}Installing EAS CLI...${NC}"
    npm install -g eas-cli
fi
echo ""

# Step 3
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 3: Login to Expo${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
eas login
echo ""

# Step 4
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 4: Remove OLD FCM Credentials${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: When prompted, do the following:${NC}"
echo "  1. Select: Android"
echo "  2. Select: production"
echo "  3. Select: Google Service Account Key"
echo "  4. Choose: Remove Google Service Account Key"
echo "  5. Confirm removal"
echo ""
echo -e "${RED}This will remove the old credentials tied to the old package name.${NC}"
echo ""
read -p "Press Enter to open credentials manager..."
echo ""

eas credentials

echo ""
echo -e "${GREEN}✓ Old credentials should now be removed${NC}"
echo ""

# Step 5
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 5: Upload NEW FCM Credentials${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Now upload the NEW service account key:${NC}"
echo "  1. Select: Android"
echo "  2. Select: production"
echo "  3. Select: Google Service Account Key"
echo "  4. Choose: Upload a service account key from a local file"
echo "  5. Select the JSON file you downloaded in Step 1"
echo "  6. Confirm upload"
echo ""
read -p "Press Enter to open credentials manager..."
echo ""

eas credentials

echo ""
echo -e "${GREEN}✓ New credentials uploaded!${NC}"
echo ""

# Step 6
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 6: Rebuild Android App${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}You need to rebuild your Android app with the new credentials.${NC}"
echo ""
echo "Which build would you like to create?"
echo "  1) Preview build (APK - for testing)"
echo "  2) Production build (AAB - for Play Store)"
echo "  3) Skip rebuild (I'll do it later)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo -e "${BLUE}Building preview...${NC}"
    eas build --platform android --profile preview
    ;;
  2)
    echo -e "${BLUE}Building production...${NC}"
    eas build --platform android --profile production
    ;;
  3)
    echo -e "${YELLOW}Skipping rebuild. Remember to build before testing!${NC}"
    ;;
  *)
    echo -e "${RED}Invalid choice. Skipping rebuild.${NC}"
    ;;
esac

echo ""

# Final Instructions
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Install the NEW build on your Android device"
echo "2. Log in and grant notification permissions"
echo "3. Test with Expo tool: https://expo.dev/notifications"
echo "4. Test order status notifications"
echo ""
echo -e "${GREEN}Android notifications should now work! 🎉${NC}"
echo ""
echo -e "${BLUE}For detailed information, see:${NC}"
echo "  - FIX_ANDROID_PACKAGE_NAME_NOTIFICATIONS.md"
echo "  - FCM_CREDENTIALS_SETUP_GUIDE.md"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"

