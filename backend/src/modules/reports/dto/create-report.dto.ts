import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportReason } from '@prisma/client';

export class CreateReportDto {
  @ApiPropertyOptional({ description: 'Reported user ID' })
  @IsOptional()
  @IsString()
  reportedUserId?: string;

  @ApiPropertyOptional({ description: 'Reported post ID' })
  @IsOptional()
  @IsString()
  reportedPostId?: string;

  @ApiPropertyOptional({ description: 'Reported review ID' })
  @IsOptional()
  @IsString()
  reportedReviewId?: string;

  @ApiProperty({ description: 'Reason for report', enum: ReportReason })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
