const { adminNotifications, sendPushNotification } = require('../app/context/NotificationContext');

// Test function to verify notification logging
async function testNotificationLogging() {
  console.log('🧪 Testing Notification Logging...\n');

  // Test 1: Check if sendPushNotification logs properly
  console.log('📊 Test 1: sendPushNotification logging');
  const testToken = 'ExponentPushToken[test-token]';
  
  try {
    const result = await sendPushNotification(testToken, 'Test Title', 'Test Body');
    console.log(`✅ sendPushNotification result: ${result}`);
  } catch (error) {
    console.log(`❌ sendPushNotification error: ${error.message}`);
  }

  // Test 2: Check admin notifications
  console.log('\n📊 Test 2: Admin notifications');
  
  try {
    const testResult = await adminNotifications.sendTestNotification(testToken);
    console.log(`✅ Test notification result: ${testResult}`);
  } catch (error) {
    console.log(`❌ Test notification error: ${error.message}`);
  }

  console.log('\n🎯 Expected Results:');
  console.log('- No repeated "pushTokenStringggggg" logs');
  console.log('- No repeated "message" logs');
  console.log('- Clean, single logs for each operation');
  console.log('- Proper error handling without spam');
}

// Run the test
testNotificationLogging().catch(console.error); 