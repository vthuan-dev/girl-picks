import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlockedDateDto {
  @ApiProperty({ description: 'Date to block', example: '2024-12-25' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Reason for blocking' })
  @IsOptional()
  @IsString()
  reason?: string;
}
