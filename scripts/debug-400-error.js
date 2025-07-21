// Debug script to identify the cause of 400 error
async function debug400Error() {
  console.log('🔍 Debugging 400 Error in Token Registration...\n');

  // Test different request body formats
  const testCases = [
    {
      name: 'Current Format (user_id)',
      body: {
        user_id: 'test-user-id-123',
        expo_push_token: 'ExponentPushToken[test-token-123]',
        device_type: 'ios'
      }
    },
    {
      name: 'Alternative Format (userId)',
      body: {
        userId: 'test-user-id-123',
        expo_push_token: 'ExponentPushToken[test-token-123]',
        device_type: 'ios'
      }
    },
    {
      name: 'Alternative Format (player_id)',
      body: {
        user_id: 'test-user-id-123',
        player_id: 'ExponentPushToken[test-token-123]',
        device_type: 'ios'
      }
    },
    {
      name: 'Alternative Format (token)',
      body: {
        user_id: 'test-user-id-123',
        token: 'ExponentPushToken[test-token-123]',
        device_type: 'ios'
      }
    },
    {
      name: 'Alternative Format (push_token)',
      body: {
        user_id: 'test-user-id-123',
        push_token: 'ExponentPushToken[test-token-123]',
        device_type: 'ios'
      }
    },
    {
      name: 'Alternative Format (deviceType)',
      body: {
        user_id: 'test-user-id-123',
        expo_push_token: 'ExponentPushToken[test-token-123]',
        deviceType: 'ios'
      }
    }
  ];

  console.log('📋 Possible Causes of 400 Error:');
  console.log('1. Wrong field names in request body');
  console.log('2. Missing required fields');
  console.log('3. Invalid data types');
  console.log('4. Invalid token format');
  console.log('5. Invalid user ID format');
  console.log('6. Backend validation errors');

  console.log('\n🔧 Common Field Name Variations:');
  console.log('- user_id vs userId vs user');
  console.log('- expo_push_token vs player_id vs token vs push_token');
  console.log('- device_type vs deviceType vs platform');

  console.log('\n📝 Current Implementation:');
  console.log('```javascript');
  console.log('const requestBody = {');
  console.log('  user_id: userId,');
  console.log('  expo_push_token: expoPushToken,');
  console.log('  device_type: Platform.OS,');
  console.log('};');
  console.log('```');

  console.log('\n🧪 Test Cases to Try:');
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}:`);
    console.log('   Body:', JSON.stringify(testCase.body, null, 2));
  });

  console.log('\n🔍 Debugging Steps:');
  console.log('1. Check console logs for detailed error response');
  console.log('2. Verify the exact field names expected by backend');
  console.log('3. Test with different field name variations');
  console.log('4. Check if user ID format is correct');
  console.log('5. Verify token format is valid');
  console.log('6. Check backend API documentation');

  console.log('\n📡 API Endpoint Details:');
  console.log('URL: https://water-supplier-2.onrender.com/api/k1/notifications/registerDevice');
  console.log('Method: POST');
  console.log('Headers: Content-Type: application/json, Authorization: Bearer {token}');

  console.log('\n🚨 Next Steps:');
  console.log('1. Run the app and check console for detailed error logs');
  console.log('2. Look for the exact error message in the response body');
  console.log('3. Compare with backend API documentation');
  console.log('4. Test with different field name combinations');
  console.log('5. Verify the backend endpoint is working correctly');

  console.log('\n💡 Quick Fixes to Try:');
  console.log('1. Change user_id to userId');
  console.log('2. Change expo_push_token to player_id');
  console.log('3. Change device_type to deviceType');
  console.log('4. Remove device_type field entirely');
  console.log('5. Add additional required fields');

  console.log('\n✅ Enhanced logging has been added to both contexts!');
  console.log('Check the console for detailed request/response information.');
}

// Run the debug script
debug400Error().catch(console.error); 