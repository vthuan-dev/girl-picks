import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailableSlotsDto {
  @ApiProperty({ description: 'Girl ID' })
  @IsString()
  girlId: string;

  @ApiProperty({ description: 'Start date', example: '2024-12-25' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date', example: '2024-12-31' })
  @IsDateString()
  endDate: string;
}

export class TimeSlotResponse {
  @ApiProperty()
  date: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  available: boolean;
}

