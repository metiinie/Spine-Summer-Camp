const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testing login credentials...\n');
    
    const email = 'awol@gmail.com';
    const password = '12345678';
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Password Hash:', user.passwordHash.substring(0, 30) + '...');
    console.log();
    
    // Test password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (isMatch) {
      console.log('✅ Password matches!');
      console.log('   Test password: 12345678');
    } else {
      console.log('❌ Password does NOT match');
      console.log('   Test password: 12345678');
      console.log();
      console.log('🔄 Creating new hash for comparison...');
      const newHash = await bcrypt.hash(password, 12);
      console.log('   New hash:', newHash.substring(0, 30) + '...');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
