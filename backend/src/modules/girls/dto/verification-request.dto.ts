import { IsArray, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerificationRequestDto {
  @ApiProperty({ description: 'Verification document URLs (CMND/CCCD)', type: [String] })
  @IsArray()
  @IsString({ each: true })
  documents: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

