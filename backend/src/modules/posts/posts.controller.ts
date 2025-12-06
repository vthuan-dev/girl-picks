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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
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
  @Roles(UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post (Girl only)' })
  @ApiResponse({ status: 201, description: 'Post created' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(userId, createPostDto);
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
    // Public users only see approved posts
    return this.postsService.findAll({
      status: status || PostStatus.APPROVED,
      girlId,
      page,
      limit,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own posts (Girl only)' })
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
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post (Girl only, pending posts only)' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve post (Admin only)' })
  @ApiResponse({ status: 200, description: 'Post approved' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() approveDto: ApprovePostDto,
  ) {
    return this.postsService.approve(id, adminId, approveDto.notes);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject post (Admin only)' })
  @ApiResponse({ status: 200, description: 'Post rejected' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() rejectDto: RejectPostDto,
  ) {
    return this.postsService.reject(id, adminId, rejectDto.reason);
  }
}
