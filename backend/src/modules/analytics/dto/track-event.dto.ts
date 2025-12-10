import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackEventDto {
  @ApiProperty({ description: 'Session ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'Event name' })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiPropertyOptional({ description: 'Event data' })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Timestamp' })
  @IsString()
  @IsOptional()
  timestamp?: string;
}

