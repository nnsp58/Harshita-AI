// src/models/database.js - Database Connection & Models (using Prisma)

const { PrismaClient } = require('@prisma/client');

let prisma = null;

try {
  prisma = new PrismaClient({
    log: ['error']
  });
  
  prisma.$connect()
    .then(() => console.log('📦 Database connected'))
    .catch(() => {
      console.log('⚠️ Database not available - running in memory mode');
      prisma = null;
    });
} catch (e) {
  console.log('⚠️ Database not configured');
  prisma = null;
}

process.on('beforeExit', async () => {
  if (prisma) await prisma.$disconnect();
});

module.exports = { prisma };