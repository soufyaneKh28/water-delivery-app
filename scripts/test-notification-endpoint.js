#!/usr/bin/env node

/**
 * Test script to verify backend notification endpoints
 * This script tests if the getDeviceTokens endpoint exists and works correctly
 */

const axios = require('axios');

const API_BASE_URL = 'https://water-supplier-2.onrender.com/api/k1';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGetDeviceTokensEndpoint() {
  log('\n' + '='.repeat(60), 'cyan');
  log('Testing Backend Notification Endpoints', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  // You'll need to replace these with actual values
  const testUserId = 'YOUR_USER_ID_HERE'; // Replace with actual user ID
  const testAccessToken = 'YOUR_ACCESS_TOKEN_HERE'; // Replace with actual access token

  if (testUserId === 'YOUR_USER_ID_HERE' || testAccessToken === 'YOUR_ACCESS_TOKEN_HERE') {
    log('⚠️  Please update the script with actual userId and accessToken', 'yellow');
    log('\nTo get these values:', 'yellow');
    log('1. Log into your app', 'yellow');
    log('2. Check the console logs for:', 'yellow');
    log('   - User ID: Look for login success logs', 'yellow');
    log('   - Access Token: Look for authentication logs', 'yellow');
    log('\nOR run this in your app\'s console:', 'yellow');
    log('   supabase.auth.getSession().then(s => console.log(s.data))', 'cyan');
    return;
  }

  log('Testing: GET /notifications/getDeviceTokens/:userId\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/notifications/getDeviceTokens/${testUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${testAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log('✅ Endpoint exists and is working!', 'green');
    log('\nResponse:', 'cyan');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.tokens && response.data.tokens.length > 0) {
      log(`\n✅ Found ${response.data.tokens.length} device token(s)`, 'green');
      response.data.tokens.forEach((token, idx) => {
        log(`   ${idx + 1}. ${token.substring(0, 30)}...`, 'blue');
      });
    } else {
      log('\n⚠️  No device tokens found for this user', 'yellow');
      log('   Make sure the user has logged in and registered their device', 'yellow');
    }

  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        log('❌ Endpoint does not exist (404 Not Found)', 'red');
        log('\n📋 Backend needs to implement this endpoint:', 'yellow');
        log('   GET /api/k1/notifications/getDeviceTokens/:userId', 'cyan');
        log('\n📖 See ORDER_STATUS_NOTIFICATIONS_FIX.md for implementation details', 'yellow');
      } else if (error.response.status === 401) {
        log('❌ Unauthorized (401)', 'red');
        log('   Your access token may be expired or invalid', 'yellow');
        log('   Please get a fresh token and try again', 'yellow');
      } else {
        log(`❌ Error: ${error.response.status} ${error.response.statusText}`, 'red');
        if (error.response.data) {
          console.log('\nResponse:', error.response.data);
        }
      }
    } else if (error.request) {
      log('❌ No response from server', 'red');
      log('   Check your internet connection and backend URL', 'yellow');
    } else {
      log(`❌ Error: ${error.message}`, 'red');
    }
  }

  log('\n' + '='.repeat(60), 'cyan');
  log('Test Complete', 'bright');
  log('='.repeat(60) + '\n', 'cyan');
}

async function testRegisterDeviceEndpoint() {
  log('\n' + '='.repeat(60), 'cyan');
  log('Testing: POST /notifications/registerDevice', 'blue');
  log('='.repeat(60) + '\n', 'cyan');

  const testUserId = 'YOUR_USER_ID_HERE';
  const testAccessToken = 'YOUR_ACCESS_TOKEN_HERE';
  const testPushToken = 'ExponentPushToken[XXXXXXXXXXXXXXXXXXXXXX]';

  if (testUserId === 'YOUR_USER_ID_HERE') {
    log('ℹ️  Skipping registerDevice test (no credentials provided)', 'blue');
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/registerDevice`,
      {
        user_id: testUserId,
        player_id: testPushToken,
        device_type: 'android',
      },
      {
        headers: {
          'Authorization': `Bearer ${testAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log('✅ Device registration endpoint is working!', 'green');
    console.log('\nResponse:', response.data);
  } catch (error) {
    log(`⚠️  Could not test device registration: ${error.message}`, 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');
}

// Run tests
(async () => {
  log('\n🧪 Backend Notification Endpoint Test Suite\n', 'magenta');
  
  await testGetDeviceTokensEndpoint();
  // await testRegisterDeviceEndpoint(); // Uncomment to test registration endpoint
  
  log('\n📚 For more information, see:', 'cyan');
  log('   - ORDER_STATUS_NOTIFICATIONS_FIX.md', 'blue');
  log('   - FCM_CREDENTIALS_SETUP_GUIDE.md\n', 'blue');
})();

