import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password (min 8 characters, must contain uppercase, lowercase, number)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    default: UserRole.CUSTOMER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Bio (for Girls)' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Districts (for Girls)', type: [String] })
  @IsOptional()
  districts?: string[];
}
