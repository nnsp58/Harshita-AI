// scripts/update-gemini-key.js
const { PrismaClient } = require('@prisma/client');
const { encrypt } = require('../src/utils/cryptoHelper');

const prisma = new PrismaClient();
const key = 'AIzaSyAnAd3GI_c-U0vMlMJm5Bxc3n6wDKU_75o';

async function main() {
  console.log('🔄 Encrypting and saving Gemini API Key to database...');
  const encrypted = encrypt(key);
  await prisma.systemSetting.upsert({
    where: { key: 'api_key_gemini' },
    update: { value: encrypted },
    create: { key: 'api_key_gemini', value: encrypted }
  });
  console.log('✅ Gemini API Key encrypted and saved to SQLite Database settings!');
}

main()
  .catch(err => {
    console.error('❌ Error updating database settings:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
