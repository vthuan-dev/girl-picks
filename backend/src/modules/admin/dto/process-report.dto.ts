import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessReportDto {
  @ApiProperty({
    description: 'Action to take',
    enum: ['RESOLVED', 'DISMISSED'],
  })
  @IsEnum(['RESOLVED', 'DISMISSED'])
  action: 'RESOLVED' | 'DISMISSED';

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
