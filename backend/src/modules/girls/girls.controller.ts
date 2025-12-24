import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Post,
  ParseIntPipe,
  DefaultValuePipe,
  ParseFloatPipe,
  Delete,
} from '@nestjs/common';
import { GirlsService } from './girls.service';
import { UpdateGirlDto } from './dto/update-girl.dto';
import { CreateGirlProductDto } from './dto/create-girl-product.dto';
import { VerificationRequestDto } from './dto/verification-request.dto';
import {
  AddGirlImagesDto,
  RemoveGirlImageDto,
} from './dto/manage-girl-images.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GirlManagerGuard } from '../../common/guards/girl-manager.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, VerificationStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Girls')
@Controller('girls')
export class GirlsController {
  constructor(private readonly girlsService: GirlsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all girls (public)' })
  @ApiQuery({ name: 'districts', required: false, type: [String] })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiQuery({ name: 'verification', required: false, enum: VerificationStatus })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isPremium', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'priceFilter', required: false, type: String })
  @ApiQuery({ name: 'ageFilter', required: false, type: String })
  @ApiQuery({ name: 'heightFilter', required: false, type: String })
  @ApiQuery({ name: 'weightFilter', required: false, type: String })
  @ApiQuery({ name: 'originFilter', required: false, type: String })
  @ApiQuery({ name: 'locationFilter', required: false, type: String })
  @ApiQuery({ name: 'province', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: [String],
    description: 'Array of tags to filter by',
  })
  @ApiResponse({ status: 200, description: 'List of girls' })
  findAll(
    @Query('districts') districts?: string | string[],
    @Query('rating', new DefaultValuePipe(0), ParseFloatPipe) rating?: number,
    @Query('verification') verification?: VerificationStatus,
    @Query('isFeatured') isFeatured?: string,
    @Query('isPremium') isPremium?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('priceFilter') priceFilter?: string,
    @Query('ageFilter') ageFilter?: string,
    @Query('heightFilter') heightFilter?: string,
    @Query('weightFilter') weightFilter?: string,
    @Query('originFilter') originFilter?: string,
    @Query('locationFilter') locationFilter?: string,
    @Query('province') province?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string | string[],
  ) {
    const districtsArray = districts
      ? Array.isArray(districts)
        ? districts
        : [districts]
      : undefined;

    const tagsArray = tags ? (Array.isArray(tags) ? tags : [tags]) : undefined;

    return this.girlsService.findAll({
      districts: districtsArray,
      rating: rating && rating > 0 ? rating : undefined,
      verification,
      isFeatured:
        isFeatured === 'true'
          ? true
          : isFeatured === 'false'
            ? false
            : undefined,
      isPremium:
        isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
      page,
      limit,
      priceFilter,
      ageFilter,
      heightFilter,
      weightFilter,
      originFilter,
      locationFilter,
      province,
      search,
      tags: tagsArray,
    });

    console.log('[GirlsController] Filter params:', {
      province,
      locationFilter,
      priceFilter,
      ageFilter,
    });
  }

  @Get('search/by-phone')
  @Public()
  @ApiOperation({ summary: 'Search girls by phone hoặc tên (public)' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Số điện thoại hoặc từ khóa tên',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchByPhone(
    @Query('q') q: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.girlsService.searchByPhone(q, page, limit);
  }

  @Get('search/by-name')
  @Public()
  @ApiOperation({ summary: 'Search girls by name (public)' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Từ khóa tên/bio/location',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchByName(
    @Query('q') q: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.girlsService.searchByName(q, page, limit);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add images to girl (Admin/Staff)' })
  @ApiResponse({ status: 200, description: 'Images updated' })
  addImages(@Param('id') id: string, @Body() addImagesDto: AddGirlImagesDto) {
    return this.girlsService.addImages(id, addImagesDto.imageUrls);
  }

  @Delete(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove image from girl (Admin/Staff)' })
  @ApiResponse({ status: 200, description: 'Image removed' })
  removeImage(
    @Param('id') id: string,
    @Body() removeImageDto: RemoveGirlImageDto,
  ) {
    return this.girlsService.removeImage(id, removeImageDto.imageUrl);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own profile (Girl only)' })
  @ApiResponse({ status: 200, description: 'Girl profile' })
  findMyProfile(@CurrentUser('id') userId: string) {
    return this.girlsService.findByUserId(userId);
  }

  @Get('me/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics (Girl only)' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  getAnalytics(@CurrentUser('id') userId: string) {
    return this.girlsService.getAnalytics(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get girl by ID (public)' })
  @ApiResponse({ status: 200, description: 'Girl details' })
  @ApiResponse({ status: 404, description: 'Girl not found' })
  findOne(@Param('id') id: string) {
    return this.girlsService.findOne(id, false);
  }

  @Get('count/by-province')
  @Public()
  @ApiOperation({ summary: 'Get count of girls by province' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of province with count',
  })
  getCountByProvince() {
    return this.girlsService.getCountByProvince();
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: 'Increment girl view count (public)' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  incrementView(@Param('id') id: string) {
    return this.girlsService.incrementViewCount(id);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile (Girl only)' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  update(
    @CurrentUser('id') userId: string,
    @Body() updateGirlDto: UpdateGirlDto,
  ) {
    return this.girlsService.update(userId, updateGirlDto);
  }

  @Post('me/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request verification (Girl only)' })
  @ApiResponse({ status: 200, description: 'Verification requested' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  requestVerification(
    @CurrentUser('id') userId: string,
    @Body() verificationDto: VerificationRequestDto,
  ) {
    return this.girlsService.requestVerification(
      userId,
      verificationDto.documents,
      verificationDto.notes,
    );
  }

  @Post(':id/verification/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve verification (Admin only)' })
  @ApiResponse({ status: 200, description: 'Verification approved' })
  approveVerification(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.girlsService.approveVerification(id, adminId);
  }

  @Post(':id/verification/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject verification (Admin only)' })
  @ApiResponse({ status: 200, description: 'Verification rejected' })
  rejectVerification(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.girlsService.rejectVerification(id, adminId, reason);
  }

  // ============================================
  // CRUD Operations for Staff/Admin
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard, GirlManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create girl product (Staff/Admin only)' })
  @ApiResponse({ status: 201, description: 'Girl created' })
  create(
    @Body() createGirlDto: CreateGirlProductDto,
    @CurrentUser('id') managedById: string,
  ) {
    return this.girlsService.create(createGirlDto, managedById);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, GirlManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update girl by ID (Staff/Admin only)' })
  @ApiResponse({ status: 200, description: 'Girl updated' })
  updateById(
    @Param('id') id: string,
    @Body() updateGirlDto: UpdateGirlDto,
    @CurrentUser('id') managedById: string,
  ) {
    return this.girlsService.updateById(id, updateGirlDto, managedById);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, GirlManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete girl (Staff/Admin only)' })
  @ApiResponse({ status: 200, description: 'Girl deleted' })
  remove(@Param('id') id: string, @CurrentUser('id') managedById: string) {
    return this.girlsService.remove(id, managedById);
  }
}
