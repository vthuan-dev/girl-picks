import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackPageViewDto {
  @ApiProperty({ description: 'Session ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'Page path' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiPropertyOptional({ description: 'Page title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsString()
  @IsOptional()
  referrer?: string;

  @ApiPropertyOptional({ description: 'User agent' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Timestamp' })
  @IsString()
  @IsOptional()
  timestamp?: string;
}
