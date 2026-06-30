const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== DATABASE VERIFICATION ===');
  
  const usersCount = await prisma.user.count();
  const skillUsageCount = await prisma.skillUsage.count();
  const documentCount = await prisma.document.count();
  const cscCount = await prisma.cSC.count();

  console.log(`Table "users" count: ${usersCount}`);
  console.log(`Table "skill_usage" count: ${skillUsageCount}`);
  console.log(`Table "documents" count: ${documentCount}`);
  console.log(`Table "cscs" count: ${cscCount}`);

  console.log('\n=== SAMPLE USER RECORDS ===');
  const users = await prisma.user.findMany({ take: 3 });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n=== SAMPLE SKILL USAGE RECORDS ===');
  const skillUsages = await prisma.skillUsage.findMany({ take: 3 });
  console.log(JSON.stringify(skillUsages, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
