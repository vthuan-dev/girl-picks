import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, PaymentStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(userId, createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  findAll(
    @Query('bookingId') bookingId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.paymentsService.findAll(bookingId, userId);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payments by booking ID' })
  @ApiResponse({ status: 200, description: 'List of payments for booking' })
  findBookingPayments(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findAll(bookingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post(':id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process payment (Admin only - webhook handler)' })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  processPayment(
    @Param('id') id: string,
    @Body('transactionId') transactionId: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentsService.processPayment(id, transactionId, status);
  }

  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Refund payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  refund(
    @Param('id') id: string,
    @Body('refundAmount') refundAmount: number,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.refund(id, refundAmount, reason, userId);
  }
}
