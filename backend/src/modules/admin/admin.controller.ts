import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ReviewsService } from '../reviews/reviews.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProcessReportDto } from './dto/process-report.dto';
import { CreateGirlDto } from './dto/create-girl.dto';
import { UpdateGirlAdminDto } from './dto/update-girl-admin.dto';
import { UpdateGirlStatusDto } from './dto/update-girl-status.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  UserRole,
  ReportStatus,
  PostStatus,
  VerificationStatus,
} from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly reviewsService: ReviewsService,
    private readonly notificationsService: NotificationsService,
  ) {
    console.log(
      '[AdminController] Initialized with ReviewsService:',
      !!this.reviewsService,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('pending/posts')
  @ApiOperation({ summary: 'Get pending posts (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of pending posts' })
  getPendingPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getPendingPosts(page, limit);
  }

  @Get('pending/community-posts')
  @ApiOperation({ summary: 'Get pending community posts (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of pending community posts' })
  getPendingCommunityPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getPendingCommunityPosts(page, limit);
  }

  @Get('pending/review-comments')
  @ApiOperation({ summary: 'Get pending review comments (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of pending review comments' })
  getPendingReviewComments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    console.log(
      '[AdminController] getPendingReviewComments called with page:',
      page,
      'limit:',
      limit,
    );
    return this.reviewsService.getPendingComments(page, limit);
  }

  @Get('community-posts')
  @ApiOperation({
    summary: 'Get all community posts with filters (Admin only)',
  })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of community posts' })
  async getAllCommunityPosts(
    @Query('status') status?: PostStatus,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    try {
      return await this.adminService.getAllCommunityPosts({
        status,
        search,
        page,
        limit,
      });
    } catch (error) {
      console.error('Error in getAllCommunityPosts controller:', error);
      throw error;
    }
  }

  @Get('pending/reviews')
  @ApiOperation({ summary: 'Get pending reviews (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of pending reviews' })
  getPendingReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getPendingReviews(page, limit);
  }

  @Get('pending/verifications')
  @ApiOperation({ summary: 'Get pending verifications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of pending verifications' })
  getPendingVerifications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getPendingVerifications(page, limit);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get reports (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of reports' })
  getReports(
    @Query('status') status?: ReportStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getReports({ status, page, limit });
  }

  @Post('girls')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({
    summary:
      'Create girl user account (Admin/Staff only) - Only creates user, not girl profile',
  })
  @ApiResponse({ status: 201, description: 'Girl user created' })
  createGirl(@Body() createGirlDto: CreateGirlDto) {
    return this.adminService.createGirl(createGirlDto);
  }

  @Post('girls/:userId/profile')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({
    summary: 'Create girl profile from existing user (Admin/Staff only)',
  })
  @ApiResponse({ status: 201, description: 'Girl profile created' })
  createGirlProfile(
    @Param('userId') userId: string,
    @Body()
    profileDto: {
      bio?: string;
      districts?: string[];
      images?: string[];
      age?: number;
      name?: string;
      // Physical Info
      height?: string;
      weight?: string;
      measurements?: string;
      origin?: string;
      // Location
      address?: string;
      location?: string;
      province?: string;
      // Pricing & Services
      price?: string;
      workingHours?: string;
      tags?: string[];
      services?: string[];
    },
  ) {
    return this.adminService.createGirlProfileFromUser(userId, profileDto);
  }

  @Get('girls/without-profile')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({
    summary: 'Get GIRL users without girl profile (Admin/Staff only)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of users without profiles' })
  getGirlsWithoutProfile(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getGirlsWithoutProfile(page, limit);
  }

  @Patch('girls/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Update girl profile (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Girl updated' })
  updateGirl(
    @Param('id') id: string,
    @Body() updateGirlDto: UpdateGirlAdminDto,
  ) {
    return this.adminService.updateGirlProfile(id, updateGirlDto);
  }

  @Patch('girls/:id/status')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Toggle girl active status (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  toggleGirlStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateGirlStatusDto,
  ) {
    return this.adminService.toggleGirlStatus(id, statusDto.isActive);
  }

  @Get('girls')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Get all girls with filters (Admin/Staff only)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({
    name: 'verificationStatus',
    required: false,
    enum: VerificationStatus,
  })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isPremium', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of girls' })
  getAllGirls(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('verificationStatus') verificationStatus?: VerificationStatus,
    @Query('isFeatured') isFeatured?: string,
    @Query('isPremium') isPremium?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getAllGirls({
      search,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      verificationStatus,
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
    });
  }

  @Get('girls/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Get girl details (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Girl details' })
  getGirlDetails(@Param('id') id: string) {
    return this.adminService.getGirlDetails(id);
  }

  @Delete('girls/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Delete girl (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Girl deleted' })
  deleteGirl(@Param('id') id: string) {
    return this.adminService.deleteGirl(id);
  }

  @Post('staff')
  @ApiOperation({ summary: 'Create staff upload account (Admin only)' })
  @ApiResponse({ status: 201, description: 'Staff created' })
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.adminService.createStaff(createStaffDto);
  }

  @Get('staff')
  @ApiOperation({ summary: 'List staff accounts (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of staff accounts' })
  listStaff(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getStaffList(page, limit);
  }

  @Patch('staff/:id/activate')
  @ApiOperation({ summary: 'Activate staff account (Admin only)' })
  activateStaff(@Param('id') id: string) {
    return this.adminService.setStaffStatus(id, true);
  }

  @Patch('staff/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate staff account (Admin only)' })
  deactivateStaff(@Param('id') id: string) {
    return this.adminService.setStaffStatus(id, false);
  }

  @Post('reports/:id/process')
  @ApiOperation({ summary: 'Process report (Admin only)' })
  @ApiResponse({ status: 200, description: 'Report processed' })
  processReport(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() processReportDto: ProcessReportDto,
  ) {
    return this.adminService.processReport(
      id,
      adminId,
      processReportDto.action,
      processReportDto.notes,
    );
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Audit logs' })
  getAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getAuditLogs(page, limit);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of users' })
  getAllUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getAllUsers({
      role,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page,
      limit,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (Admin only)' })
  @ApiResponse({ status: 200, description: 'User details' })
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated' })
  activateUser(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id, true);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  deactivateUser(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id, false);
  }

  @Post('users/:id/approve-girl')
  @ApiOperation({ summary: 'Approve GIRL account (activate) (Admin only)' })
  @ApiResponse({ status: 200, description: 'Girl user approved and activated' })
  approveGirl(@Param('id') id: string) {
    return this.adminService.approveGirlUser(id);
  }

  @Post('users/:id/reject-girl')
  @ApiOperation({ summary: 'Reject GIRL account (Admin only)' })
  @ApiResponse({ status: 200, description: 'Girl user rejected/deactivated' })
  rejectGirl(@Param('id') id: string) {
    return this.adminService.rejectGirlUser(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'System settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update system settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  updateSettings(@Body() updateSettingsDto: any) {
    return this.adminService.updateSettings(updateSettingsDto);
  }

  // ============================================
  // Posts Management
  // ============================================

  @Get('posts')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Get all posts with filters (Admin/Staff only)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'girlId', required: false, type: String })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of posts' })
  getAllPosts(
    @Query('search') search?: string,
    @Query('status') status?: PostStatus,
    @Query('girlId') girlId?: string,
    @Query('authorId') authorId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getAllPosts({
      search,
      status,
      girlId,
      authorId,
      page,
      limit,
    });
  }

  @Get('posts/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Get post details (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Post details' })
  getPostDetails(@Param('id') id: string) {
    return this.adminService.getPostDetails(id);
  }

  @Post('posts')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Create post as admin (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Post created' })
  createPost(
    @CurrentUser('id') adminId: string,
    @Body()
    createPostDto: {
      title: string;
      content?: string;
      images?: string[];
      girlId?: string;
      status?: PostStatus;
    },
  ) {
    return this.adminService.createPostAsAdmin(adminId, createPostDto);
  }

  @Patch('posts/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Update post as admin (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Post updated' })
  updatePost(
    @Param('id') id: string,
    @Body()
    updatePostDto: {
      title?: string;
      content?: string;
      images?: string[];
      girlId?: string;
      status?: PostStatus;
    },
  ) {
    return this.adminService.updatePostAsAdmin(id, updatePostDto);
  }

  @Delete('posts/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiOperation({ summary: 'Delete post as admin (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Post deleted' })
  deletePost(@Param('id') id: string) {
    return this.adminService.deletePostAsAdmin(id);
  }

  // ============================================
  // Notifications Management
  // ============================================

  @Get('notifications')
  @ApiOperation({ summary: 'Get admin notifications' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getNotifications(
    @CurrentUser('id') adminId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const isReadFilter = unreadOnly === 'true' ? false : undefined;
    const notifications = await this.notificationsService.findAll(adminId, isReadFilter);
    return notifications.slice(0, limit);
  }

  @Get('notifications/unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@CurrentUser('id') adminId: string) {
    const count = await this.notificationsService.getUnreadCount(adminId);
    return { count };
  }

  @Post('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markNotificationAsRead(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.notificationsService.markAsRead(id, adminId);
  }

  @Post('notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllNotificationsAsRead(@CurrentUser('id') adminId: string) {
    return this.notificationsService.markAllAsRead(adminId);
  }
}
