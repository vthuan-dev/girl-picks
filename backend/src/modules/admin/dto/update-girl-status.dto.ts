import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGirlStatusDto {
  @ApiProperty({ description: 'Set girl active status' })
  @IsBoolean()
  isActive: boolean;
}
