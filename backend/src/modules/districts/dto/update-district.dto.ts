import { PartialType } from '@nestjs/swagger';
import { CreateDistrictDto } from './create-district.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDistrictDto extends PartialType(CreateDistrictDto) {
  @ApiPropertyOptional({ description: 'Is district active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

