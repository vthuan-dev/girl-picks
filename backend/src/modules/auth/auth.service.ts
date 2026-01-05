import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  hashPassword,
  comparePassword,
} from '../../common/utils/password.util';
import { generateTokens, TokenPayload } from '../../common/utils/jwt.util';
import jwtConfig from '../../config/jwt.config';
import { UserRole, User } from '@prisma/client';
import * as crypto from 'crypto';

type ResetTokenValue = {
  token: string;
  expiry: string | Date;
};

const isResetTokenValue = (value: unknown): value is ResetTokenValue => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return (
    'token' in value &&
    typeof (value as { token: unknown }).token === 'string' &&
    'expiry' in value
  );
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      fullName,
      phone,
      role: requestedRole,
      bio,
      districts,
    } = registerDto;

    const role = requestedRole || UserRole.CUSTOMER;

    // Prevent registering as ADMIN or STAFF_UPLOAD - these must be created by existing admins
    if (role === UserRole.ADMIN || role === UserRole.STAFF_UPLOAD) {
      throw new BadRequestException(
        'Cannot register as ADMIN or STAFF_UPLOAD. These roles must be assigned by existing administrators.',
      );
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const isGirlPending = role === UserRole.GIRL;

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
        role,
        isActive: !isGirlPending, // GIRL must wait for admin approval
      },
    });

    // Create girl profile if role is GIRL
    if (role === UserRole.GIRL) {
      await this.prisma.girl.create({
        data: {
          userId: user.id,
          bio: bio || null,
          districts: districts || [],
          name: fullName,
          images: [],
        },
      });

      // Notify all admins about pending approval
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN, isActive: true },
        select: { id: true },
      });
      const notificationPayload = {
        type: 'GIRL_PENDING_APPROVAL' as any,
        message: `Tài khoản GIRL mới chờ duyệt: ${fullName}`,
        data: { userId: user.id, email, fullName },
      };
      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            type: notificationPayload.type,
            message: notificationPayload.message,
            data: notificationPayload.data,
          },
        });
      }
    }

    // If GIRL pending, do not issue tokens; require admin approval first
    if (isGirlPending) {
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        pendingApproval: true,
        message:
          'Tài khoản GIRL đã tạo. Vui lòng chờ admin duyệt để kích hoạt.',
      };
    }

    // Generate tokens for active users
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const config = jwtConfig();
    const tokens = await generateTokens(
      this.jwtService,
      payload,
      config.jwt.secret || 'jwt-secret',
      config.jwt.expiresIn || '15m',
      config.jwt.refreshSecret || 'refresh-secret',
      config.jwt.refreshExpiresIn || '7d',
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        girl: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account is not active. Please wait for admin approval.',
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last active for girls
    if (user.role === UserRole.GIRL && user.girl) {
      await this.prisma.girl.update({
        where: { id: user.girl.id },
        data: {
          lastActiveAt: new Date(),
        },
      });
    }

    // Generate tokens
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const config = jwtConfig();
    const tokens = await generateTokens(
      this.jwtService,
      payload,
      config.jwt.secret || 'jwt-secret',
      config.jwt.expiresIn || '15m',
      config.jwt.refreshSecret || 'refresh-secret',
      config.jwt.refreshExpiresIn || '7d',
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        girl: user.girl
          ? {
              id: user.girl.id,
              bio: user.girl.bio,
              districts: user.girl.districts,
              ratingAverage: user.girl.ratingAverage,
              verificationStatus: user.girl.verificationStatus,
            }
          : null,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const config = jwtConfig();
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        {
          secret: config.jwt.refreshSecret || 'refresh-secret',
        },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const tokens = await generateTokens(
        this.jwtService,
        tokenPayload,
        config.jwt.secret || 'jwt-secret',
        config.jwt.expiresIn || '15m',
        config.jwt.refreshSecret || 'refresh-secret',
        config.jwt.refreshExpiresIn || '7d',
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    // For security, we don't reveal whether the email exists or not
    // Always return the same message
    
    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    this.logger.log(`Password reset request received for email: "${email}" (normalized: "${normalizedEmail}")`);
    
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Only proceed if user exists
    if (user) {
      this.logger.log(`✅ User found: ${user.email} (ID: ${user.id}, Name: ${user.fullName})`);
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token in database
      await this.prisma.setting.upsert({
        where: { key: `reset_token_${user.id}` },
        update: {
          value: {
            token: resetToken,
            expiry: resetTokenExpiry,
          },
        },
        create: {
          key: `reset_token_${user.id}`,
          value: {
            token: resetToken,
            expiry: resetTokenExpiry,
          },
        },
      });

      this.logger.log(`Reset token generated and stored for user: ${user.id}`);

      // Send email with reset link
      try {
        this.logger.log(`Attempting to send password reset email to ${user.email}...`);
        await this.emailService.sendPasswordResetEmail(
          user.email,
          resetToken,
          user.fullName,
        );
        this.logger.log(`✅ Password reset email sent successfully to ${user.email}`);
      } catch (error) {
        // Log error but don't expose it to user for security
        this.logger.error(
          `❌ Failed to send password reset email to ${user.email}:`,
          error,
        );
        // In development, we might want to know about this
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn(
            'Email sending failed. Check SMTP configuration.',
          );
        }
      }
    } else {
      // Log for monitoring but don't reveal to user
      this.logger.warn(`❌ Password reset requested for non-existent email: "${normalizedEmail}" (original: "${email}")`);
    }

    // Always return the same message for security
    const response: { message: string; resetToken?: string } = {
      message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn.',
    };

    // In development, return token for testing (only if user exists and token was generated)
    if (process.env.NODE_ENV === 'development' && user) {
      // Get the token we just stored
      const setting = await this.prisma.setting.findUnique({
        where: { key: `reset_token_${user.id}` },
      });
      if (setting?.value && isResetTokenValue(setting.value)) {
        response.resetToken = setting.value.token;
      }
    }

    return response;
  }

  async resetPassword(token: string, newPassword: string) {
    // Find user with this reset token
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'reset_token_',
        },
      },
    });

    let user: User | null = null;

    for (const setting of settings) {
      if (!isResetTokenValue(setting.value)) {
        continue;
      }

      const tokenData = setting.value;

      if (tokenData.token === token) {
        if (new Date(tokenData.expiry) < new Date()) {
          throw new BadRequestException('Reset token has expired');
        }

        const userId = setting.key.replace('reset_token_', '');
        user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          break;
        }
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Delete reset token
    await this.prisma.setting
      .delete({
        where: { key: `reset_token_${user.id}` },
      })
      .catch(() => {
        // Ignore if already deleted
      });

    return { message: 'Password reset successfully' };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await comparePassword(password, user.password))) {
      const { password: _password, ...result } = user;
      void _password;
      return result;
    }

    return null;
  }
}
