import { PartialType } from '@nestjs/swagger';
import { CreateVenueDto } from './create-venue.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {
  @ApiPropertyOptional({ description: 'Is venue active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
