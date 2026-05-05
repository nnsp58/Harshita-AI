const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3001/api';

  try {
    console.log('Testing Ravan SaaS API...');

    // Test root
    const root = await axios.get(`${baseURL}/`);
    console.log('✅ Root API:', root.data.name);

    // Test CSC signup
    const signupData = {
      name: 'Test CSC Center',
      address: 'Test Address, UP',
      contactEmail: 'test@csc.com',
      contactPhone: '9876543210',
      vleId: 'VLE123',
      plan: 'free'
    };
    const signup = await axios.post(`${baseURL}/csc/signup`, signupData);
    console.log('✅ CSC Signup:', signup.data.message);
    const cscId = signup.data.csc.id;

    // Test login
    const loginData = { email: signup.data.admin.email, password: 'admin123' };
    const login = await axios.post(`${baseURL}/auth/login`, loginData);
    console.log('✅ Login:', login.data.data.user.name);
    const token = login.data.data.token;

    // Test dashboard
    const dashboard = await axios.get(`${baseURL}/csc/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard:', dashboard.data.stats);

    // Test candidate upload (public)
    const candidateData = {
      cscId,
      name: 'Ram Singh',
      fatherName: 'Shyam Singh',
      dob: '1990-01-01',
      gender: 'male',
      aadhaar: '123456789012',
      mobile: '9876543210',
      village: 'Test Village',
      tehsil: 'Test Tehsil',
      district: 'Test District',
      state: 'Uttar Pradesh',
      pincode: '123456'
    };
    const candidate = await axios.post(`${baseURL}/candidates/public`, candidateData, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Candidate Added:', candidate.data.candidate.name);

    console.log('\n🎉 All tests passed! Ravan SaaS working perfectly.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();