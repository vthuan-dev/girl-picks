import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createStaff() {
  const email = process.env.STAFF_EMAIL || 'staff@gaigo1.net';
  const password = process.env.STAFF_PASSWORD || 'Staff123!@#';
  const fullName = process.env.STAFF_NAME || 'Staff Upload';

  // Check if staff already exists
  const existingStaff = await prisma.user.findUnique({
    where: { email },
  });

  if (existingStaff) {
    console.log(`✅ Staff user already exists: ${email}`);
    return existingStaff;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create staff user
  const staff = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role: UserRole.STAFF_UPLOAD,
      isActive: true,
    },
  });

  console.log('✅ Staff user created successfully!');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`👤 Role: ${staff.role}`);
  console.log(`🆔 ID: ${staff.id}`);

  return staff;
}

createStaff()
  .catch((error) => {
    console.error('❌ Error creating staff:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

