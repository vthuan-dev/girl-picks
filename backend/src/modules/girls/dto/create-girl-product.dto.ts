import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGirlProductDto {
  @ApiPropertyOptional({ description: 'Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Age' })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(60)
  age?: number;

  @ApiPropertyOptional({ description: 'Bio/Description' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Birth year' })
  @IsOptional()
  @IsInt()
  birthYear?: number;

  @ApiPropertyOptional({ description: 'Height' })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({ description: 'Weight' })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional({ description: 'Measurements' })
  @IsOptional()
  @IsString()
  measurements?: string;

  @ApiPropertyOptional({ description: 'Origin' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Province' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'District IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  districts?: string[];

  @ApiPropertyOptional({ description: 'Image URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Services', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ description: 'Working hours' })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Is available' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Is featured' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Is premium' })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
