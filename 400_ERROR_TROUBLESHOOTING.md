# 400 Error Troubleshooting Guide

## Overview
This guide helps you debug and fix the 400 error that occurs when trying to register push tokens with the backend.

## What is a 400 Error?
A 400 (Bad Request) error means the server cannot process the request due to client-side issues, such as:
- Invalid request format
- Missing required fields
- Wrong field names
- Invalid data types
- Malformed JSON

## Enhanced Debugging Features Added

### 1. **Detailed Logging**
Both AuthContext and NotificationContext now include:
- Request body logging
- Response status logging
- Response headers logging
- Detailed error response parsing
- JSON error parsing

### 2. **Test Button**
Added "Test Different Formats" button in Dashboard that tries:
- 6 different field name combinations
- Reports which format works
- Shows detailed error messages

### 3. **Debug Script**
Created `scripts/debug-400-error.js` with:
- Common field name variations
- Test cases for different formats
- Troubleshooting steps

## Common Causes and Solutions

### 1. **Wrong Field Names**

#### **Current Implementation:**
```javascript
{
  user_id: userId,
  expo_push_token: expoPushToken,
  device_type: Platform.OS
}
```

#### **Possible Alternatives:**
```javascript
// Alternative 1
{
  userId: userId,
  expo_push_token: expoPushToken,
  device_type: Platform.OS
}

// Alternative 2
{
  user_id: userId,
  player_id: expoPushToken,
  device_type: Platform.OS
}

// Alternative 3
{
  user_id: userId,
  token: expoPushToken,
  device_type: Platform.OS
}

// Alternative 4
{
  user_id: userId,
  expo_push_token: expoPushToken,
  deviceType: Platform.OS
}
```

### 2. **Missing Required Fields**
The backend might expect additional fields like:
- `app_version`
- `os_version`
- `device_model`
- `notification_settings`

### 3. **Invalid Data Types**
- User ID might need to be a string instead of UUID
- Token might need validation
- Device type might need specific values

### 4. **Invalid Token Format**
- Token might need to be validated
- Token might be expired
- Token might be malformed

## Debugging Steps

### **Step 1: Check Console Logs**
1. Open the app
2. Go to admin dashboard
3. Check console for detailed logs
4. Look for:
   - Request body format
   - Response status
   - Error response body
   - Parsed error details

### **Step 2: Use Test Button**
1. Click "Test Different Formats" button
2. Watch console for each test case
3. Note which format succeeds
4. Update the code with the working format

### **Step 3: Verify Backend API**
1. Check backend API documentation
2. Verify the exact endpoint URL
3. Confirm required field names
4. Test with Postman or similar tool

### **Step 4: Check Data Values**
1. Verify user ID format
2. Check token format
3. Confirm device type values
4. Validate all field types

## Quick Fixes to Try

### **Fix 1: Change Field Names**
```javascript
// Try this format
const requestBody = {
  userId: userId,           // Changed from user_id
  expo_push_token: expoPushToken,
  device_type: Platform.OS,
};
```

### **Fix 2: Use Different Token Field**
```javascript
// Try this format
const requestBody = {
  user_id: userId,
  player_id: expoPushToken,  // Changed from expo_push_token
  device_type: Platform.OS,
};
```

### **Fix 3: Change Device Type Field**
```javascript
// Try this format
const requestBody = {
  user_id: userId,
  expo_push_token: expoPushToken,
  deviceType: Platform.OS,  // Changed from device_type
};
```

### **Fix 4: Remove Optional Fields**
```javascript
// Try minimal format
const requestBody = {
  user_id: userId,
  expo_push_token: expoPushToken,
  // Removed device_type
};
```

### **Fix 5: Add Required Fields**
```javascript
// Try with additional fields
const requestBody = {
  user_id: userId,
  expo_push_token: expoPushToken,
  device_type: Platform.OS,
  app_version: '1.0.0',     // Added
  os_version: '15.0',       // Added
};
```

## Testing Process

### **1. Manual Testing**
1. Use the "Test Different Formats" button
2. Check console for each test result
3. Note the successful format
4. Update the code accordingly

### **2. Console Analysis**
Look for these log patterns:
```
📤 Sending push token to backend...
📦 Request body: { ... }
📡 Response status: 400
❌ Error response body: { ... }
❌ Parsed error: { ... }
```

### **3. Backend Verification**
1. Test the API endpoint directly
2. Use Postman or curl
3. Compare with working examples
4. Check backend logs

## Expected Console Output

### **Successful Request:**
```
📤 Sending push token to backend...
👤 User ID: user-id-123
🔑 Token: ExponentPushToken[test-token-123]...
📱 Device Type: ios
📦 Request body: {
  "user_id": "user-id-123",
  "expo_push_token": "ExponentPushToken[test-token-123]",
  "device_type": "ios"
}
📡 Response status: 200
✅ Token registered with backend successfully
📦 Response data: { ... }
```

### **Failed Request (400):**
```
📤 Sending push token to backend...
📦 Request body: { ... }
📡 Response status: 400
❌ Failed to register token with backend: 400 Bad Request
❌ Error response body: { "error": "Invalid field name" }
❌ Parsed error: { "error": "Invalid field name" }
```

## Next Steps

### **Immediate Actions:**
1. Run the app and check console logs
2. Use the "Test Different Formats" button
3. Identify the working format
4. Update the code with correct field names

### **If Still Failing:**
1. Check backend API documentation
2. Verify the endpoint is working
3. Test with Postman
4. Contact backend developer

### **After Fixing:**
1. Test the automatic token sending
2. Verify notifications work
3. Update documentation
4. Monitor for any issues

## Files Modified for Debugging

### **Enhanced Files:**
- `app/context/AuthContext.js` - Added detailed logging
- `app/context/NotificationContext.jsx` - Added detailed logging
- `app/screens/admin/Dashboard.jsx` - Added test button

### **New Files:**
- `scripts/debug-400-error.js` - Debug script
- `400_ERROR_TROUBLESHOOTING.md` - This guide

## Support

If you're still experiencing issues:
1. Check the console logs for detailed error information
2. Use the test button to try different formats
3. Compare with backend API documentation
4. Test the endpoint directly with Postman

---

**Status**: 🔧 **DEBUGGING** - Enhanced logging and testing tools added
**Next Step**: Run the app and check console for detailed error information
**Goal**: Identify the correct field names and request format for the backend API 