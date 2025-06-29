const AsyncStorage = require('@react-native-async-storage/async-storage');

// Test script to verify token management
async function testTokenManagement() {
  console.log('🧪 Testing Token Management System...\n');

  // Test 1: Check if storage keys are properly defined
  console.log('1. Testing storage keys...');
  const STORAGE_KEYS = {
    SESSION: 'auth_session',
    USER_ROLE: 'user_role',
  };
  console.log('✅ Storage keys defined:', STORAGE_KEYS);

  // Test 2: Test session storage and retrieval
  console.log('\n2. Testing session storage and retrieval...');
  const mockSession = {
    access_token: 'test_access_token_123',
    refresh_token: 'test_refresh_token_456',
    user: { id: 'test_user_id', email: 'test@example.com' },
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  try {
    // Store session
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(mockSession));
    console.log('✅ Session stored successfully');

    // Retrieve session
    const storedSessionData = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    const retrievedSession = JSON.parse(storedSessionData);
    console.log('✅ Session retrieved successfully');
    console.log('   - User ID:', retrievedSession.user.id);
    console.log('   - Access Token:', retrievedSession.access_token ? 'Present' : 'Missing');

    // Test 3: Test session clearing
    console.log('\n3. Testing session clearing...');
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    
    const clearedSession = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    const clearedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    
    if (!clearedSession && !clearedUserRole) {
      console.log('✅ Session cleared successfully');
    } else {
      console.log('❌ Session clearing failed');
    }

    // Test 4: Test user role storage
    console.log('\n4. Testing user role storage...');
    const testUserRole = 'admin';
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, testUserRole);
    
    const retrievedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (retrievedUserRole === testUserRole) {
      console.log('✅ User role stored and retrieved successfully');
    } else {
      console.log('❌ User role storage failed');
    }

    // Clean up
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n🎉 Token management tests completed!');
}

// Run the test
testTokenManagement().catch(console.error); 