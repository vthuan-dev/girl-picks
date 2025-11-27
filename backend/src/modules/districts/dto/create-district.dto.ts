import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDistrictDto {
  @ApiProperty({ description: 'District name', example: 'Quận 1' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Province name', example: 'Sài Gòn' })
  @IsString()
  province: string;
}

