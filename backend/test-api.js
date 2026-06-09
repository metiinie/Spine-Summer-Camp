async function testBackendAPI() {
  try {
    console.log('🔍 Testing backend API endpoint...\n');
    
    const backendUrl = 'http://localhost:4000';
    const credentials = {
      email: 'awol@gmail.com',
      password: '12345678'
    };
    
    console.log(`Calling: ${backendUrl}/auth/login`);
    console.log('Credentials:', credentials);
    console.log();
    
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    console.log();
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Login failed');
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Make sure the backend is running on port 4000!');
  }
}

testBackendAPI();
