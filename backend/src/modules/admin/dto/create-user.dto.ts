import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password (min 8 chars, uppercase/lowercase/number)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must include uppercase, lowercase letters and a number',
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
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
