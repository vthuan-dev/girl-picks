import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGirlDto {
  @ApiProperty({ description: 'Email for the girl account' })
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

  @ApiProperty({ description: 'Display name' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Profile bio/description' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'District IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  districts?: string[];

  @ApiPropertyOptional({ description: 'Initial image URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Age' })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(60)
  age?: number;
}
