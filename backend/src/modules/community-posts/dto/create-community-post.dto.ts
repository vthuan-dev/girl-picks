import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityPostDto {
  @ApiPropertyOptional({ description: 'Post title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Post content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Girl ID (optional, if post is about a specific girl)',
  })
  @IsOptional()
  @IsString()
  girlId?: string;

  @ApiPropertyOptional({ description: 'Image URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
