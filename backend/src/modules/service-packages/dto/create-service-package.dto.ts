import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServicePackageDto {
  @ApiProperty({ description: 'Package name', example: 'Gói 2 giờ uống rượu' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Package description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Duration in hours', minimum: 1, maximum: 8 })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Price' })
  @IsNumber()
  @Min(0)
  price: number;
}
