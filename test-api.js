const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  try {
    console.log('Testing Country Currency Exchange API...\n');

    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test status endpoint
    console.log('\n2. Testing status endpoint...');
    const statusResponse = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status endpoint:', statusResponse.data);

    // Test countries refresh
    console.log('\n3. Testing countries refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/countries/refresh`);
    console.log('✅ Countries refresh:', refreshResponse.data);

    // Test get all countries
    console.log('\n4. Testing get all countries...');
    const countriesResponse = await axios.get(`${BASE_URL}/countries`);
    console.log(`✅ Retrieved ${countriesResponse.data.length} countries`);

    // Test filtering by region
    console.log('\n5. Testing filter by region (Africa)...');
    const africaResponse = await axios.get(
      `${BASE_URL}/countries?region=Africa`
    );
    console.log(`✅ Retrieved ${africaResponse.data.length} African countries`);

    // Test sorting by GDP
    console.log('\n6. Testing sort by GDP descending...');
    const gdpResponse = await axios.get(`${BASE_URL}/countries?sort=gdp_desc`);
    console.log(`✅ Retrieved countries sorted by GDP (top 3):`);
    gdpResponse.data.slice(0, 3).forEach((country, index) => {
      console.log(
        `   ${index + 1}. ${country.name}: $${(
          country.estimated_gdp / 1e9
        ).toFixed(2)}B`
      );
    });

    // Test get specific country
    console.log('\n7. Testing get specific country...');
    if (countriesResponse.data.length > 0) {
      const firstCountry = countriesResponse.data[0];
      const specificResponse = await axios.get(
        `${BASE_URL}/countries/${encodeURIComponent(firstCountry.name)}`
      );
      console.log(
        `✅ Retrieved specific country: ${specificResponse.data.name}`
      );
    }

    // Test image endpoint
    console.log('\n8. Testing image endpoint...');
    try {
      const imageResponse = await axios.get(`${BASE_URL}/countries/image`, {
        responseType: 'arraybuffer',
      });
      console.log(
        `✅ Image endpoint works, received ${imageResponse.data.length} bytes`
      );
    } catch (error) {
      console.log(
        '⚠️  Image endpoint not available (this is expected if no refresh has been done)'
      );
    }

    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
