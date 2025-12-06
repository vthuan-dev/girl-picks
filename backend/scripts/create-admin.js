const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const fullName = process.env.ADMIN_NAME || 'Admin User';

  try {
    console.log('🔍 Đang kiểm tra kết nối database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Kết nối database thành công!\n');

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
    console.log('🔐 Đang hash password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log('👤 Đang tạo admin user...');
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log('\n✅ Tạo admin thành công!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🎭 Role: ${admin.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 Bây giờ bạn có thể login với thông tin trên!');
    console.log(`   URL: http://localhost:3001/auth/login\n`);
  } catch (error) {
    console.error('\n❌ Lỗi khi tạo admin:');
    console.error(error.message);
    if (error.code === 'P1001') {
      console.error('\n💡 Kiểm tra:');
      console.error('   - MySQL đang chạy?');
      console.error('   - DATABASE_URL trong .env đúng chưa?');
      console.error('   - Database đã được tạo chưa?');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

