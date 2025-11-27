import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, ReviewStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review (Customer only)' })
  @ApiResponse({ status: 201, description: 'Review created' })
  create(@CurrentUser('id') userId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all reviews (public - approved only)' })
  @ApiQuery({ name: 'status', required: false, enum: ReviewStatus })
  @ApiQuery({ name: 'girlId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  findAll(
    @Query('status') status?: ReviewStatus,
    @Query('girlId') girlId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.reviewsService.findAll({
      status: status || ReviewStatus.APPROVED,
      girlId,
      page,
      limit,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own reviews (Customer only)' })
  @ApiResponse({ status: 200, description: 'List of own reviews' })
  findMyReviews(@CurrentUser('id') userId: string, @Query('status') status?: ReviewStatus) {
    return this.reviewsService.findMyReviews(userId, status);
  }

  @Get('girl/:girlId')
  @Public()
  @ApiOperation({ summary: 'Get reviews by girl ID (public - approved only)' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  findByGirl(@Param('girlId') girlId: string) {
    return this.reviewsService.findByGirl(girlId, ReviewStatus.APPROVED);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get review by ID (public)' })
  @ApiResponse({ status: 200, description: 'Review details' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review (Customer only, pending reviews only)' })
  @ApiResponse({ status: 200, description: 'Review updated' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, userId, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review (Customer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.reviewsService.delete(id, userId, userRole);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review approved' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('notes') notes?: string,
  ) {
    return this.reviewsService.approve(id, adminId, notes);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review rejected' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.reviewsService.reject(id, adminId, reason);
  }
}

