const { api } = require('../app/utils/api');

// Test function to compare performance
async function testPerformance() {
  console.log('🚀 Testing API Performance...\n');

  // Test 1: Old approach (single getAllData call)
  console.log('📊 Test 1: Single getAllData call');
  const startTime1 = Date.now();
  try {
    const data = await api.getAllData();
    const endTime1 = Date.now();
    console.log(`✅ Single call completed in ${endTime1 - startTime1}ms`);
    console.log(`   - Offers: ${data.data.offers?.length || 0} items`);
    console.log(`   - Locations: ${data.data.locations?.length || 0} items`);
    console.log(`   - Categories: ${data.data.categories?.length || 0} items`);
    console.log(`   - Products: ${data.data.products?.length || 0} items\n`);
  } catch (error) {
    console.log(`❌ Single call failed: ${error.message}\n`);
  }

  // Test 2: New approach (parallel calls)
  console.log('📊 Test 2: Parallel API calls');
  const startTime2 = Date.now();
  try {
    const [offersResponse, locationsResponse, categoriesResponse, productsResponse] = await Promise.allSettled([
      api.getOffers(),
      api.getLocations(),
      api.getCategories(),
      api.getProducts()
    ]);

    const endTime2 = Date.now();
    console.log(`✅ Parallel calls completed in ${endTime2 - startTime2}ms`);
    
    if (offersResponse.status === 'fulfilled') {
      console.log(`   - Offers: ${offersResponse.value.data?.length || 0} items`);
    } else {
      console.log(`   - Offers: Failed - ${offersResponse.reason.message}`);
    }
    
    if (locationsResponse.status === 'fulfilled') {
      console.log(`   - Locations: ${locationsResponse.value.data?.length || 0} items`);
    } else {
      console.log(`   - Locations: Failed - ${locationsResponse.reason.message}`);
    }
    
    if (categoriesResponse.status === 'fulfilled') {
      console.log(`   - Categories: ${categoriesResponse.value.data?.length || 0} items`);
    } else {
      console.log(`   - Categories: Failed - ${categoriesResponse.reason.message}`);
    }
    
    if (productsResponse.status === 'fulfilled') {
      console.log(`   - Products: ${productsResponse.value.data?.length || 0} items`);
    } else {
      console.log(`   - Products: Failed - ${productsResponse.reason.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Parallel calls failed: ${error.message}`);
  }

  console.log('\n🎯 Performance Summary:');
  console.log('- Parallel calls should be faster as they run simultaneously');
  console.log('- Individual calls can fail independently without affecting others');
  console.log('- Better error handling and retry logic included');
}

// Run the test
testPerformance().catch(console.error); 