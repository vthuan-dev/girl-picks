import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGirlDto {
  @ApiPropertyOptional({ description: 'Bio/Description' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Districts (array of district IDs)', type: [String] })
  @IsOptional()
  @IsArray()
  districts?: string[];
}

