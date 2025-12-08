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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApprovePostDto } from './dto/approve-post.dto';
import { RejectPostDto } from './dto/reject-post.dto';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContentManagerGuard } from '../../common/guards/content-manager.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, PostStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post (Girl/Customer)' })
  @ApiResponse({ status: 201, description: 'Post created' })
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(userId, createPostDto, userRole);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all posts (public - approved only, admin - all)',
  })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'girlId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of posts' })
  findAll(
    @Query('status') status?: PostStatus,
    @Query('girlId') girlId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    // If status is explicitly provided, use it
    // If status is undefined and no query param, default to APPROVED for public
    // Admin can pass status query param to filter, or omit to see all (will be handled in service)
    return this.postsService.findAll({
      status,
      girlId,
      page,
      limit,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own posts (Girl/Customer)' })
  @ApiResponse({ status: 200, description: 'List of own posts' })
  findMyPosts(
    @CurrentUser('id') userId: string,
    @Query('status') status?: PostStatus,
  ) {
    return this.postsService.findMyPosts(userId, status);
  }

  @Get('girl/:girlId')
  @Public()
  @ApiOperation({ summary: 'Get posts by girl ID (public)' })
  @ApiResponse({ status: 200, description: 'List of posts' })
  findByGirl(@Param('girlId') girlId: string) {
    return this.postsService.findByGirl(girlId, PostStatus.APPROVED);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get post by ID (public)' })
  @ApiResponse({ status: 200, description: 'Post details' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id, true);
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: 'Increment post view count (public)' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  incrementView(@Param('id') id: string) {
    return this.postsService.incrementViewCount(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post (Girl/Customer only, pending posts only)' })
  @ApiResponse({ status: 200, description: 'Post updated' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post (Girl/Admin only)' })
  @ApiResponse({ status: 200, description: 'Post deleted' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.postsService.delete(id, userId, userRole);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve post (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Post approved' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() approveDto: ApprovePostDto,
  ) {
    return this.postsService.approve(id, adminId, approveDto.notes);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject post (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Post rejected' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() rejectDto: RejectPostDto,
  ) {
    return this.postsService.reject(id, adminId, rejectDto.reason);
  }

  // ============================================
  // CRUD Operations for Staff/Admin
  // ============================================

  @Post('admin')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post as admin/staff (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Post created' })
  createAsAdmin(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(userId, createPostDto, userRole);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update any post (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Post updated' })
  updateAsAdmin(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updateAsAdmin(id, userId, updatePostDto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete any post (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Post deleted' })
  deleteAsAdmin(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.postsService.deleteAsAdmin(id, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a post (Customer/Admin)' })
  @ApiResponse({ status: 200, description: 'Like toggled' })
  toggleLike(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.postsService.toggleLike(id, userId);
  }

  @Get(':id/likes')
  @Public()
  @ApiOperation({ summary: 'Get likes count for a post' })
  @ApiResponse({ status: 200, description: 'Likes count' })
  getLikes(@Param('id') id: string) {
    return this.postsService.getLikes(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to a post (Customer/Admin/Girl)' })
  @ApiResponse({ status: 201, description: 'Comment added' })
  addComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() createPostCommentDto: CreatePostCommentDto,
  ) {
    return this.postsService.addComment(
      id, 
      userId, 
      createPostCommentDto.content,
      createPostCommentDto.parentId,
    );
  }

  @Get(':id/comments')
  @Public()
  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of comments' })
  getComments(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.postsService.getComments(id, page, limit);
  }

  @Get('comments/:commentId/replies')
  @Public()
  @ApiOperation({ summary: 'Get replies for a comment' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of replies' })
  getReplies(
    @Param('commentId') commentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.postsService.getReplies(commentId, page, limit);
  }
}
