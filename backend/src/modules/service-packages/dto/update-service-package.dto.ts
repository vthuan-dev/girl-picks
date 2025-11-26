import { PartialType } from '@nestjs/swagger';
import { CreateServicePackageDto } from './create-service-package.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServicePackageDto extends PartialType(CreateServicePackageDto) {
  @ApiPropertyOptional({ description: 'Is package active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

