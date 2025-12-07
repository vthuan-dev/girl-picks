import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Create Prisma Client - sẽ tự động đọc DATABASE_URL từ .env
const prisma = new PrismaClient();

async function createAdmin() {
  // Lấy thông tin từ environment variables hoặc dùng giá trị mặc định
  const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123';
  const fullName = process.env.ADMIN_NAME || 'Admin User';
  const phone = process.env.ADMIN_PHONE || undefined;

  try {
    console.log('🔍 Đang kiểm tra admin hiện có...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`\n⚠️  Admin với email ${email} đã tồn tại!`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🎭 Role: ${existingAdmin.role}`);
      console.log(`   ✅ Status: ${existingAdmin.isActive ? 'Hoạt động' : 'Tạm khóa'}`);
      console.log(`\n💡 Bạn có thể login với email: ${email}`);
      return;
    }

    // Validate password
    if (password.length < 8) {
      console.error('❌ Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      console.error('❌ Mật khẩu phải có chữ hoa, chữ thường và số!');
      return;
    }

    console.log('🔐 Đang hash mật khẩu...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('📝 Đang tạo admin user...');
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log('\n✅ Tạo admin thành công!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:        ${email}`);
    console.log(`🔑 Password:    ${password}`);
    console.log(`👤 Full Name:   ${fullName}`);
    console.log(`📱 Phone:       ${phone || 'N/A'}`);
    console.log(`🎭 Role:        ${admin.role}`);
    console.log(`🆔 User ID:     ${admin.id}`);
    console.log(`✅ Status:      ${admin.isActive ? 'Hoạt động' : 'Tạm khóa'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 Bây giờ bạn có thể login với thông tin trên!');
    console.log(`   Frontend: http://localhost:3001/auth/login`);
    console.log(`   Backend API: http://localhost:3000/auth/login`);
  } catch (error: any) {
    console.error('\n❌ Lỗi khi tạo admin:');
    if (error.code === 'P2002') {
      console.error('   Email đã tồn tại trong hệ thống!');
    } else {
      console.error('   ', error.message || error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
createAdmin();

