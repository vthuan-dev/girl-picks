import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  girlId: string;

  @ApiProperty({ required: false })
  servicePackageId?: string;

  @ApiProperty()
  serviceType: string;

  @ApiProperty()
  bookingDate: Date;

  @ApiProperty()
  duration: number;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  depositAmount: number;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ required: false })
  specialRequests?: string;

  @ApiProperty({ required: false })
  cancellationReason?: string;

  @ApiProperty({ required: false })
  cancelledAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
