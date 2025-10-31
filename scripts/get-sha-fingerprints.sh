#!/bin/bash

echo "=========================================="
echo "Getting SHA Fingerprints for Firebase"
echo "=========================================="
echo ""

echo "📱 Package Name: com.miaahaljunaidi.app"
echo ""

# Check if we're in the right directory
if [ ! -d "android" ]; then
    echo "❌ Error: android directory not found. Please run this from the project root."
    exit 1
fi

# Check if debug.keystore exists
if [ ! -f "android/app/debug.keystore" ]; then
    echo "❌ Error: debug.keystore not found at android/app/debug.keystore"
    exit 1
fi

echo "🔑 Debug Keystore SHA Fingerprints:"
echo "-----------------------------------"

# Get SHA fingerprints using keytool
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -E "SHA1:|SHA256:"

echo ""
echo "📋 Next Steps:"
echo "1. Copy the SHA1 and SHA256 values above"
echo "2. Go to Firebase Console: https://console.firebase.google.com/"
echo "3. Select your project: miaahaljunaidi"
echo "4. Go to Project Settings → Your apps → Android app"
echo "5. Add both SHA-1 and SHA-256 fingerprints"
echo "6. Download the new google-services.json"
echo "7. Replace your current google-services.json file"
echo ""
echo "See FIREBASE_OAUTH_FIX.md for detailed instructions"
echo ""


