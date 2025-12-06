import {
  IsString,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ServiceType {
  DRINKING = 'drinking',
  DATING = 'dating',
  BOTH = 'both',
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Girl ID' })
  @IsString()
  girlId: string;

  @ApiPropertyOptional({ description: 'Service Package ID' })
  @IsOptional()
  @IsString()
  servicePackageId?: string;

  @ApiProperty({ description: 'Service type', enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({
    description: 'Booking date and time',
    example: '2024-12-25T18:00:00Z',
  })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ description: 'Duration in hours', minimum: 1, maximum: 8 })
  @IsInt()
  @Min(1)
  @Max(8)
  duration: number;

  @ApiPropertyOptional({ description: 'Location/venue address' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Total price' })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ description: 'Deposit amount (30-50% of total price)' })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiPropertyOptional({ description: 'Special requests' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
