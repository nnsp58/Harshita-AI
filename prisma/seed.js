const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const csc = await prisma.cSC.upsert({
    where: { id: 'default-csc' },
    update: {},
    create: {
      id: 'default-csc',
      name: 'Default CSC',
      address: 'Default CSC Address',
      contact_email: 'admin@csc.gov.in',
      contact_phone: '9876543210',
      plan: 'free',
      is_active: true
    }
  });
  console.log('âœ… Created default CSC:', csc.name);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@csc.gov.in' },
    update: {},
    create: {
      email: 'admin@csc.gov.in',
      password_hash: adminPassword,
      name: 'System Admin',
      role: 'csc_admin',
      is_active: true,
      csc_id: csc.id
    }
  });
  console.log('✅ Created admin user:', admin.email);

  // Create VLE user
  const vlePassword = await bcrypt.hash('vle123456', 12);
  const vle = await prisma.user.upsert({
    where: { email: 'vle@example.com' },
    update: {},
    create: {
      email: 'vle@example.com',
      password_hash: vlePassword,
      name: 'Test VLE',
      role: 'operator',
      is_active: true,
      csc_id: csc.id
    }
  });
  console.log('✅ Created VLE user:', vle.email);

  // Create test candidate
  const candidate = await prisma.candidate.upsert({
    where: { aadhaar_number: '123456789012' },
    update: {
      verification_status: 'verified',
      verified_at: new Date(),
      verified_by: vle.id,
      verified_profile: {
        personal: {
          fullName: 'Test Candidate',
          fatherName: 'Test Father',
          motherName: 'Test Mother',
          dob: '1990-01-01',
          gender: 'male',
          category: 'general'
        },
        contact: {
          email: 'candidate@test.com',
          phone: '9876543210'
        },
        address: {
          line1: 'Test Village',
          line2: 'Test Tehsil',
          district: 'Test District',
          state: 'Test State',
          pincode: '123456'
        },
        documents: {
          aadhaar: '123456789012'
        },
        employment: {
          occupation: 'Farmer',
          annualIncome: 100000
        }
      }
    },
    create: {
      name: 'Test Candidate',
      father_name: 'Test Father',
      mother_name: 'Test Mother',
      dob: new Date('1990-01-01'),
      gender: 'male',
      aadhaar_number: '123456789012',
      mobile: '9876543210',
      email: 'candidate@test.com',
      village: 'Test Village',
      tehsil: 'Test Tehsil',
      district: 'Test District',
      state: 'Test State',
      pincode: '123456',
      category: 'general',
      occupation: 'Farmer',
      annual_income: 100000,
      verification_status: 'verified',
      verified_at: new Date(),
      verified_by: vle.id,
      verified_profile: {
        personal: {
          fullName: 'Test Candidate',
          fatherName: 'Test Father',
          motherName: 'Test Mother',
          dob: '1990-01-01',
          gender: 'male',
          category: 'general'
        },
        contact: {
          email: 'candidate@test.com',
          phone: '9876543210'
        },
        address: {
          line1: 'Test Village',
          line2: 'Test Tehsil',
          district: 'Test District',
          state: 'Test State',
          pincode: '123456'
        },
        documents: {
          aadhaar: '123456789012'
        },
        employment: {
          occupation: 'Farmer',
          annualIncome: 100000
        }
      },
      csc_id: csc.id,
      user_id: vle.id
    }
  });
  console.log('✅ Created test candidate:', candidate.name);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@csc.gov.in / admin123');
  console.log('   VLE: vle@example.com / vle123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
