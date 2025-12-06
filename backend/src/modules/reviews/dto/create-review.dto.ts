import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Girl ID to review' })
  @IsString()
  girlId: string;

  @ApiProperty({ description: 'Review title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Review content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Image URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
