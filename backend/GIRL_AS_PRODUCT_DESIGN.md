# 🎯 Thiết kế: Girl là Vật phẩm, không phải User

## 📋 Yêu cầu:
1. **Girl là vật phẩm/sản phẩm** - Không phải User
2. **Có User đặc biệt** (role < ADMIN) để quản lý/update Girl
3. **User này có quyền CRUD Girl**
4. **Girl độc lập**, không cần link với User

## 🔄 Thay đổi Schema:

### 1. Update UserRole Enum:
```prisma
enum UserRole {
  ADMIN           // Quyền cao nhất
  MODERATOR       // Quản lý Girl (NEW - nhỏ hơn ADMIN)
  STAFF_UPLOAD    // Upload content (có thể dùng role này)
  CUSTOMER        // Khách hàng
  GIRL            // (Có thể xóa hoặc giữ cho tương lai)
}
```

### 2. Update Girl Model:
```prisma
model Girl {
  id                      String             @id @default(uuid())
  userId                  String?            @unique // ✅ Optional - Girl không cần User
  
  // Thêm field để track ai quản lý Girl
  managedById             String?            // User ID của người quản lý (MODERATOR/STAFF)
  managedBy               User?              @relation("GirlManager", fields: [managedById], references: [id], onDelete: SetNull)
  
  // ... existing fields ...
  
  // Thêm fields từ crawler
  phone                   String?
  price                   String?
  height                  String?
  weight                  String?
  measurements            String?
  origin                  String?
  address                 String?
  location                String?
  province                String?
  birthYear               Int?
  tags                    Json               @default("[]")
  services                Json               @default("[]")
  workingHours            String?
  isAvailable             Boolean            @default(true)
  
  // Relations
  user            User?            @relation("GirlUser", fields: [userId], references: [id], onDelete: SetNull) // Optional
  managedBy       User?            @relation("GirlManager", fields: [managedById], references: [id], onDelete: SetNull) // NEW
  // ... other relations ...
}
```

### 3. Update User Model:
```prisma
model User {
  // ... existing fields ...
  
  // Relations
  girl                    Girl?              @relation("GirlUser") // Optional
  managedGirls            Girl[]             @relation("GirlManager") // NEW - Girls được quản lý bởi user này
  // ... other relations ...
}
```

## 🔐 Permissions & Roles:

### Role Hierarchy:
```
ADMIN (Quyền cao nhất)
  ↓
MODERATOR/STAFF_UPLOAD (Quản lý Girl)
  ↓
CUSTOMER (Khách hàng)
```

### Permissions cho MODERATOR/STAFF_UPLOAD:
- ✅ **CREATE** Girl (từ crawler hoặc manual)
- ✅ **READ** Girl (xem tất cả)
- ✅ **UPDATE** Girl (chỉnh sửa thông tin)
- ✅ **DELETE** Girl (xóa)
- ✅ **VERIFY** Girl (xác thực)
- ❌ **Không có quyền** quản lý User, Settings, System

### Permissions cho ADMIN:
- ✅ Tất cả quyền của MODERATOR
- ✅ Quản lý User
- ✅ Quản lý Settings
- ✅ Quản lý System
- ✅ Quản lý MODERATOR

## 📝 Update Code:

### 1. Create Guards:
```typescript
// backend/src/common/guards/girl-manager.guard.ts
@Injectable()
export class GirlManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // ADMIN và MODERATOR/STAFF_UPLOAD có quyền
    return user?.role === UserRole.ADMIN || 
           user?.role === UserRole.MODERATOR ||
           user?.role === UserRole.STAFF_UPLOAD;
  }
}
```

### 2. Update Girls Controller:
```typescript
@Controller('girls')
@UseGuards(JwtAuthGuard)
export class GirlsController {
  
  @Post()
  @UseGuards(GirlManagerGuard) // ✅ Chỉ MODERATOR/ADMIN
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF_UPLOAD)
  create(@Body() createGirlDto: CreateGirlDto, @CurrentUser('id') userId: string) {
    return this.girlsService.create(createGirlDto, userId); // userId = managedById
  }
  
  @Patch(':id')
  @UseGuards(GirlManagerGuard) // ✅ Chỉ MODERATOR/ADMIN
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF_UPLOAD)
  update(
    @Param('id') id: string,
    @Body() updateGirlDto: UpdateGirlDto,
    @CurrentUser('id') userId: string
  ) {
    return this.girlsService.update(id, updateGirlDto, userId); // Track who updated
  }
  
  @Delete(':id')
  @UseGuards(GirlManagerGuard) // ✅ Chỉ MODERATOR/ADMIN
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  remove(@Param('id') id: string) {
    return this.girlsService.remove(id);
  }
  
  // Public endpoints - không cần auth
  @Get()
  @Public()
  findAll(@Query() filters: GirlFiltersDto) {
    return this.girlsService.findAll(filters);
  }
  
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.girlsService.findOne(id);
  }
}
```

### 3. Update Girls Service:
```typescript
@Injectable()
export class GirlsService {
  
  async create(createGirlDto: CreateGirlDto, managedById: string) {
    return this.prisma.girl.create({
      data: {
        ...createGirlDto,
        managedById, // Track who created/manages this girl
        userId: null, // Girl không cần User
      },
    });
  }
  
  async update(id: string, updateGirlDto: UpdateGirlDto, managedById: string) {
    // Check permission - chỉ admin hoặc người quản lý mới update được
    const girl = await this.prisma.girl.findUnique({ where: { id } });
    
    if (!girl) {
      throw new NotFoundException('Girl not found');
    }
    
    // Check if user is admin or manager of this girl
    const currentUser = await this.prisma.user.findUnique({ 
      where: { id: managedById },
      select: { role: true }
    });
    
    if (currentUser?.role !== UserRole.ADMIN && 
        girl.managedById !== managedById) {
      throw new ForbiddenException('You do not have permission to update this girl');
    }
    
    return this.prisma.girl.update({
      where: { id },
      data: {
        ...updateGirlDto,
        managedById, // Update manager if changed
      },
    });
  }
  
  async findAll(filters?: GirlFiltersDto) {
    // Remove user relation check - Girl is independent
    const where: Prisma.GirlWhereInput = {
      isActive: true, // Only active girls
    };
    
    // ... rest of filters
  }
}
```

## 🚀 Migration Steps:

### Step 1: Update Schema
```bash
# 1. Sửa schema.prisma
# 2. Tạo migration
npx prisma migrate dev --name make_girl_product_with_manager
```

### Step 2: Create MODERATOR User
```typescript
// backend/scripts/create-moderator.ts
async function createModerator() {
  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@gaigo1.net',
      password: hashedPassword,
      fullName: 'Moderator',
      role: UserRole.MODERATOR, // hoặc STAFF_UPLOAD
    },
  });
}
```

### Step 3: Update Existing Code
- Remove `userId` required checks
- Add `managedById` tracking
- Update guards và permissions
- Update services để không require user relation

## 📊 Workflow:

### Import từ Crawler:
1. MODERATOR/STAFF upload JSON từ crawler
2. System tạo Girl records với `managedById = moderator.id`
3. `userId = null` (Girl không cần User)
4. Girl hiển thị như sản phẩm

### Update Girl:
1. MODERATOR/ADMIN login
2. Chọn Girl cần update
3. System check permission (admin hoặc manager của Girl đó)
4. Update và track `managedById`

## ✅ Kết quả:

1. ✅ Girl là vật phẩm độc lập
2. ✅ Có User (MODERATOR/STAFF_UPLOAD) quản lý Girl
3. ✅ Permissions rõ ràng (role < ADMIN)
4. ✅ Track được ai quản lý Girl nào
5. ✅ Dễ import từ crawler (không cần User)

