import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'sex tự quay' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug', example: 'sex-tu-quay' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'Is category active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

