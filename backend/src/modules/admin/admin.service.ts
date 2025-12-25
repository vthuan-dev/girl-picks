import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Prisma,
  PostStatus,
  ReviewStatus,
  VerificationStatus,
  BookingStatus,
  ReportStatus,
  UserRole,
} from '@prisma/client';
import { hashPassword } from '../../common/utils/password.util';
import { CreateGirlDto } from './dto/create-girl.dto';
import { UpdateGirlAdminDto } from './dto/update-girl-admin.dto';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats() {
    const [
      totalUsers,
      totalGirls,
      totalCustomers,
      totalPosts,
      totalReviews,
      totalBookings,
      totalRevenue,
      pendingPosts,
      pendingReviews,
      pendingCommunityPosts,
      pendingVerifications,
      pendingReports,
      activeUsers,
      completedBookings,
    ] = await Promise.all([
      // Total counts
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'GIRL' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.post.count(),
      this.prisma.review.count(),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { amount: true },
      }),

      // Pending items
      this.prisma.post.count({ where: { status: PostStatus.PENDING } }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
      this.prisma.communityPost.count({
        where: { status: PostStatus.PENDING },
      }),
      this.prisma.girl.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      }),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),

      // Active stats
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
    ]);

    // Get recent activities
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const recentBookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            fullName: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Get monthly revenue trend (last 12 months)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const monthlyRevenue = await this.prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: {
          gte: lastYear,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      overview: {
        totalUsers,
        totalGirls,
        totalCustomers,
        totalPosts,
        totalReviews,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeUsers,
        completedBookings,
      },
      pending: {
        posts: pendingPosts,
        reviews: pendingReviews,
        communityPosts: pendingCommunityPosts,
        verifications: pendingVerifications,
        reports: pendingReports,
      },
      recent: {
        users: recentUsers,
        bookings: recentBookings,
      },
      trends: {
        monthlyRevenue,
      },
    };
  }

  async getPendingPosts(page = 1, limit = 20) {
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: PostStatus.PENDING },
        include: {
          girl: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.post.count({ where: { status: PostStatus.PENDING } }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingCommunityPosts(page = 1, limit = 20) {
    const [posts, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where: { status: PostStatus.PENDING },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
          girl: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.communityPost.count({
        where: { status: PostStatus.PENDING },
      }),
    ]);

    return {
      data: posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllCommunityPosts(filters?: {
    status?: PostStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      // Check if Prisma Client has communityPost model
      if (!this.prisma.communityPost) {
        throw new Error(
          'Prisma Client does not have communityPost model. Please run: npx prisma generate',
        );
      }

      const { status, search, page = 1, limit = 20 } = filters || {};

      const where: Prisma.CommunityPostWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { content: { contains: search } },
          {
            author: {
              fullName: { contains: search },
            },
          },
        ];
      }

      const [posts, total] = await Promise.all([
        this.prisma.communityPost.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                role: true,
              },
            },
            girl: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
            approvedBy: {
              select: {
                id: true,
                fullName: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.communityPost.count({ where }),
      ]);

      return {
        data: posts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error('Error in getAllCommunityPosts:', error);
      // Provide more detailed error message
      if (
        error.message?.includes('Unknown model') ||
        error.message?.includes('does not exist')
      ) {
        throw new Error(
          'Database table community_posts does not exist. Please run: npx prisma migrate deploy',
        );
      }
      if (error.code === 'P2001' || error.code === 'P2025') {
        throw new Error(
          'Community posts table not found. Please check database migration.',
        );
      }
      throw error;
    }
  }

  async getPendingReviews(page = 1, limit = 20) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { status: ReviewStatus.PENDING },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          girl: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingVerifications(page = 1, limit = 20) {
    const [girls, total] = await Promise.all([
      this.prisma.girl.findMany({
        where: { verificationStatus: VerificationStatus.PENDING },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { verificationRequestedAt: 'asc' },
      }),
      this.prisma.girl.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      }),
    ]);

    return {
      data: girls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReports(filters?: {
    status?: ReportStatus;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 20 } = filters || {};

    const where: Prisma.ReportWhereInput = {};

    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          // reportedPostId and reportedReviewId are fields, not relations
          reviewedBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async processReport(
    reportId: string,
    adminId: string,
    action: 'RESOLVED' | 'DISMISSED',
    notes?: string,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: action,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: {
          admin: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createGirl(dto: CreateGirlDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hashPassword(dto.password);

    // Chỉ tạo user, không tạo girl record ngay
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.GIRL,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      user,
      needsProfileSetup: true, // Flag để frontend biết cần setup profile
    };
  }

  // Tạo girl record từ user đã có
  async createGirlProfileFromUser(
    userId: string,
    dto: {
      bio?: string;
      districts?: string[];
      images?: string[];
      age?: number;
      name?: string;
    },
  ) {
    // Kiểm tra user có tồn tại và là GIRL
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.GIRL) {
      throw new BadRequestException('User is not a GIRL');
    }

    // Kiểm tra đã có girl record chưa
    const existingGirl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (existingGirl) {
      throw new ConflictException('Girl profile already exists for this user');
    }

    // Tạo girl record
    const girl = await this.prisma.girl.create({
      data: {
        userId: user.id,
        bio: dto.bio || null,
        districts: dto.districts || [],
        images: dto.images || [],
        age: dto.age,
        name: dto.name || user.fullName,
        verificationStatus: VerificationStatus.PENDING,
        needsReverify: false,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return girl;
  }

  // Lấy users có role GIRL nhưng chưa có girl record
  async getGirlsWithoutProfile(page = 1, limit = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          role: UserRole.GIRL,
          girl: null, // Chưa có girl record
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          createdAt: true,
          isActive: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.GIRL,
          girl: null,
        },
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateGirlProfile(id: string, dto: UpdateGirlAdminDto) {
    const girl = await this.prisma.girl.findUnique({
      where: { id },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    return this.prisma.girl.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async toggleGirlStatus(id: string, isActive: boolean) {
    const girl = await this.prisma.girl.findUnique({
      where: { id },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    return this.prisma.girl.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        isActive: true,
      },
    });
  }

  async createStaff(dto: CreateStaffDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
        role: UserRole.STAFF_UPLOAD,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async getStaffList(page = 1, limit = 20) {
    const where: Prisma.UserWhereInput = {
      role: UserRole.STAFF_UPLOAD,
    };

    const [staff, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: staff,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async setStaffStatus(staffId: string, isActive: boolean) {
    const staff = await this.prisma.user.findUnique({
      where: { id: staffId, role: UserRole.STAFF_UPLOAD },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return this.prisma.user.update({
      where: { id: staffId },
      data: { isActive },
      select: {
        id: true,
        isActive: true,
      },
    });
  }

  async getAllUsers(filters?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { role, isActive, page = 1, limit = 20, search } = filters || {};

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as UserRole;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { fullName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        girl: {
          include: {
            posts: { take: 10, orderBy: { createdAt: 'desc' } },
            reviews: { take: 10, orderBy: { createdAt: 'desc' } },
            bookings: { take: 10, orderBy: { createdAt: 'desc' } },
            _count: {
              select: {
                posts: true,
                reviews: true,
                bookings: true,
                favorites: true,
              },
            },
          },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
    });

    return user;
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting admin users
    if (user.role === UserRole.ADMIN) {
      throw new ConflictException('Cannot delete admin user');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  async createUser(createUserDto: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    avatarUrl?: string;
  }) {
    const { email, password, fullName, phone, role, avatarUrl } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        role,
        avatarUrl: avatarUrl || null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create girl profile if role is GIRL
    if (role === UserRole.GIRL) {
      await this.prisma.girl.create({
        data: {
          userId: user.id,
          name: fullName,
          images: [],
          tags: [],
          services: [],
          districts: [],
        },
      });
    }

    return user;
  }

  async approveGirlUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.GIRL) {
      throw new BadRequestException(
        'Only GIRL accounts can be approved with this endpoint',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async rejectGirlUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.GIRL) {
      throw new BadRequestException(
        'Only GIRL accounts can be rejected with this endpoint',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getSettings() {
    const settings = await this.prisma.setting.findMany();

    // Convert array of settings to object
    const settingsObj: Record<string, any> = {};
    for (const setting of settings) {
      // value is already Json type from Prisma
      settingsObj[setting.key] = setting.value;
    }

    // Return with defaults
    return {
      siteName: settingsObj.siteName || 'Tìm Gái gọi',
      siteDescription:
        settingsObj.siteDescription || 'Nền tảng đặt lịch dịch vụ giải trí',
      maintenanceMode:
        settingsObj.maintenanceMode === true ||
        settingsObj.maintenanceMode === 'true',
      allowRegistration:
        settingsObj.allowRegistration !== false &&
        settingsObj.allowRegistration !== 'false',
      requireEmailVerification:
        settingsObj.requireEmailVerification === true ||
        settingsObj.requireEmailVerification === 'true',
      maxFileSize:
        typeof settingsObj.maxFileSize === 'number'
          ? settingsObj.maxFileSize
          : parseInt(String(settingsObj.maxFileSize)) || 5,
      allowedFileTypes: Array.isArray(settingsObj.allowedFileTypes)
        ? settingsObj.allowedFileTypes
        : typeof settingsObj.allowedFileTypes === 'string'
          ? settingsObj.allowedFileTypes.split(',')
          : ['jpg', 'png', 'jpeg'],
      emailHost: settingsObj.emailHost || '',
      emailPort:
        typeof settingsObj.emailPort === 'number'
          ? settingsObj.emailPort
          : parseInt(String(settingsObj.emailPort)) || 587,
      emailUser: settingsObj.emailUser || '',
      emailPassword: settingsObj.emailPassword || '',
      emailFrom: settingsObj.emailFrom || '',
      storageProvider: settingsObj.storageProvider || 'local',
      storageConfig: settingsObj.storageConfig || {},
      // Content pages
      rulesContent: settingsObj.rulesContent || '',
      termsContent: settingsObj.termsContent || '',
      privacyContent: settingsObj.privacyContent || '',
    };
  }

  async updateSettings(updateSettingsDto: any) {
    const updates: Array<Promise<any>> = [];

    for (const [key, value] of Object.entries(updateSettingsDto)) {
      // Prisma Json type accepts any JSON-serializable value
      updates.push(
        this.prisma.setting.upsert({
          where: { key },
          update: { value: value as any },
          create: { key, value: value as any },
        }),
      );
    }

    await Promise.all(updates);

    return this.getSettings();
  }

  // ============================================
  // Girls Management
  // ============================================

  async getAllGirls(filters?: {
    search?: string;
    isActive?: boolean;
    verificationStatus?: VerificationStatus;
    isFeatured?: boolean;
    isPremium?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      isActive,
      verificationStatus,
      isFeatured,
      isPremium,
      page = 1,
      limit = 20,
    } = filters || {};

    const where: Prisma.GirlWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { bio: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium;
    }

    const [girls, total] = await Promise.all([
      this.prisma.girl.findMany({
        where,
        include: {
          // TODO: Uncomment after running: npx prisma generate (need to stop server first)
          // managedBy: {
          //   select: {
          //     id: true,
          //     fullName: true,
          //     email: true,
          //   },
          // },
          _count: {
            select: {
              posts: true,
              reviews: true,
              bookings: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.girl.count({ where }),
    ]);

    return {
      data: girls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGirlDetails(girlId: string) {
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        // TODO: Uncomment after running: npx prisma generate (need to stop server first)
        // managedBy: {
        //   select: {
        //     id: true,
        //     fullName: true,
        //     email: true,
        //     phone: true,
        //   },
        // },
        posts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            status: true,
            createdAt: true,
          },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            posts: true,
            reviews: true,
            bookings: true,
          },
        },
      },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    return girl;
  }

  async deleteGirl(girlId: string) {
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    await this.prisma.girl.delete({
      where: { id: girlId },
    });

    return { message: 'Girl deleted successfully' };
  }

  // ============================================
  // Posts Management
  // ============================================

  async getAllPosts(filters?: {
    search?: string;
    status?: PostStatus;
    girlId?: string;
    authorId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      status,
      girlId,
      authorId,
      page = 1,
      limit = 20,
    } = filters || {};

    const where: Prisma.PostWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (girlId) {
      where.girlId = girlId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
          girl: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostDetails(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        girl: {
          select: {
            id: true,
            name: true,
            images: true,
            // TODO: Uncomment after running: npx prisma generate (need to stop server first)
            // phone: true,
          },
        },
        likes: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        comments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async createPostAsAdmin(
    adminId: string,
    createPostDto: {
      title: string;
      content?: string;
      images?: string[];
      girlId?: string;
      status?: PostStatus;
    },
  ) {
    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content || '',
        images: createPostDto.images || [],
        authorId: adminId,
        ...(createPostDto.girlId !== undefined && {
          girlId: createPostDto.girlId,
        }),
        status: createPostDto.status || PostStatus.APPROVED,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        girl: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updatePostAsAdmin(
    postId: string,
    updatePostDto: {
      title?: string;
      content?: string;
      images?: string[];
      girlId?: string;
      status?: PostStatus;
    },
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(updatePostDto.title && { title: updatePostDto.title }),
        ...(updatePostDto.content !== undefined && {
          content: updatePostDto.content,
        }),
        ...(updatePostDto.images && { images: updatePostDto.images }),
        ...(updatePostDto.girlId !== undefined && {
          girlId: updatePostDto.girlId,
        }),
        ...(updatePostDto.status && { status: updatePostDto.status }),
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        girl: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deletePostAsAdmin(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }
}
