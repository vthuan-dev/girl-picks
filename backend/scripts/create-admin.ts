import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Create Prisma Client - sẽ tự động đọc DATABASE_URL từ .env
const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const fullName = process.env.ADMIN_NAME || 'Admin User';

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`❌ Admin với email ${email} đã tồn tại!`);
      console.log(`   Bạn có thể login với email: ${email}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log('✅ Tạo admin thành công!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🎭 Role: ${admin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 Bây giờ bạn có thể login với thông tin trên!');
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

