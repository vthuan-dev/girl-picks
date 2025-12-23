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
import { CommunityPostsService } from './community-posts.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { ApproveCommunityPostDto } from './dto/approve-community-post.dto';
import { RejectCommunityPostDto } from './dto/reject-community-post.dto';
import { CreateCommunityPostCommentDto } from './dto/create-community-post-comment.dto';
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

@ApiTags('Community Posts')
@Controller('community-posts')
export class CommunityPostsController {
  constructor(private readonly communityPostsService: CommunityPostsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create community post (Girl/Customer)' })
  @ApiResponse({ status: 201, description: 'Community post created' })
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createPostDto: CreateCommunityPostDto,
  ) {
    return this.communityPostsService.create(userId, createPostDto, userRole);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all community posts (public - approved only)',
  })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'girlId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of community posts' })
  findAll(
    @Query('status') status?: PostStatus,
    @Query('girlId') girlId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.communityPostsService.findAll({
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
  @ApiOperation({ summary: 'Get own community posts (Girl/Customer)' })
  @ApiResponse({ status: 200, description: 'List of own community posts' })
  findMyPosts(
    @CurrentUser('id') userId: string,
    @Query('status') status?: PostStatus,
  ) {
    return this.communityPostsService.findMyPosts(userId, status);
  }

  @Get('interactions/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL, UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get community post interactions (likes/comments) of current user',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['likes', 'comments'],
  })
  getMyInteractions(
    @CurrentUser('id') userId: string,
    @Query('type') type?: 'likes' | 'comments',
  ) {
    const safeType: 'likes' | 'comments' =
      type === 'comments' ? 'comments' : 'likes';
    return this.communityPostsService.getUserInteractions(userId, safeType);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get community post by ID (public)' })
  @ApiResponse({ status: 200, description: 'Community post details' })
  findOne(@Param('id') id: string) {
    return this.communityPostsService.findOne(id, true);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update community post (Girl/Customer only, pending posts only)' })
  @ApiResponse({ status: 200, description: 'Community post updated' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updatePostDto: UpdateCommunityPostDto,
  ) {
    return this.communityPostsService.update(id, userId, updatePostDto);
  }

  @Patch(':id/admin')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update community post as Admin (any status)' })
  @ApiResponse({ status: 200, description: 'Community post updated by admin' })
  updateAsAdmin(
    @Param('id') id: string,
    @Body() updatePostDto: UpdateCommunityPostDto,
  ) {
    return this.communityPostsService.updateAsAdmin(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete community post (Author/Admin only)' })
  @ApiResponse({ status: 200, description: 'Community post deleted' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.communityPostsService.delete(id, userId, userRole);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve community post (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Community post approved' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() approveDto: ApproveCommunityPostDto,
  ) {
    return this.communityPostsService.approve(id, adminId, approveDto.notes);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, ContentManagerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject community post (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Community post rejected' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() rejectDto: RejectCommunityPostDto,
  ) {
    return this.communityPostsService.reject(id, adminId, rejectDto.reason);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a community post' })
  @ApiResponse({ status: 200, description: 'Like toggled' })
  toggleLike(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communityPostsService.toggleLike(id, userId);
  }

  @Get(':id/likes')
  @Public()
  @ApiOperation({ summary: 'Get likes count for a community post' })
  @ApiResponse({ status: 200, description: 'Likes count' })
  getLikes(@Param('id') id: string) {
    return this.communityPostsService.getLikes(id);
  }

  @Get(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get like status for current user' })
  @ApiResponse({ status: 200, description: 'Like status' })
  getLikeStatus(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.communityPostsService.getLikeStatus(id, userId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to a community post' })
  @ApiResponse({ status: 201, description: 'Comment added' })
  addComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() createCommentDto: CreateCommunityPostCommentDto,
  ) {
    return this.communityPostsService.addComment(id, userId, createCommentDto);
  }

  @Get(':id/comments')
  @Public()
  @ApiOperation({ summary: 'Get comments for a community post (with nested replies)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of comments with replies' })
  getComments(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.communityPostsService.getComments(id, page, limit);
  }
}

