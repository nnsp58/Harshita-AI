// Test CSC signup API
const axios = require('axios');

async function testCSCSignup() {
  try {
    const response = await axios.post('http://localhost:3001/api/csc/signup', {
      name: 'Test CSC Center',
      address: 'Delhi, India',
      contactEmail: 'test@csc.com',
      contactPhone: '9876543210',
      vleId: 'VLE123',
      plan: 'free'
    });
    console.log('✅ CSC Signup Success:', response.data);
  } catch (error) {
    console.error('❌ CSC Signup Failed:', error.response?.data || error.message);
  }
}

testCSCSignup();