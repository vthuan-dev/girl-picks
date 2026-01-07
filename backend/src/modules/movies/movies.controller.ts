import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
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

@ApiTags('Movies')
@Controller()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // Public list for /movies and /phim-sex
  @Get('movies')
  @Public()
  @ApiOperation({ summary: 'Get list of movies (public)' })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: PostStatus,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit?: number,
  ) {
    return this.moviesService.findAll({
      status: status || PostStatus.APPROVED,
      categoryId,
      search,
      page,
      limit,
    });
  }

  @Get('movies/:id')
  @Public()
  @ApiOperation({ summary: 'Get movie details (public)' })
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Get('movies/slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get movie details by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.moviesService.findBySlug(slug);
  }

  @Get('movies/:id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get reviews for a movie' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMovieReviews(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.moviesService.getReviews(id, page, limit);
  }

  @Post('movies/:id/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.GIRL, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review for a movie' })
  createMovieReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.moviesService.createReview(id, userId, body);
  }

  @Get('movies/reviews/:reviewId/comments')
  @Public()
  @ApiOperation({ summary: 'Get comments for a movie review' })
  getMovieReviewComments(@Param('reviewId') reviewId: string) {
    return this.moviesService.getReviewComments(reviewId);
  }

  @Post('movies/reviews/:reviewId/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.GIRL, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create comment (reply) for a movie review' })
  createMovieReviewComment(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { content: string; parentId?: string },
  ) {
    return this.moviesService.createReviewComment(
      reviewId,
      userId,
      body.content,
      body.parentId,
    );
  }

  @Post('movies/:id/view')
  @Public()
  @ApiOperation({ summary: 'Increment movie view count' })
  incrementView(@Param('id') id: string) {
    return this.moviesService.incrementViews(id);
  }

  // Admin endpoints
  @Get('admin/movies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get movies for admin (Admin/Staff only)' })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAdminMovies(
    @Query('status') status?: PostStatus,
    @Query('categoryId') categoryId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit?: number,
  ) {
    return this.moviesService.findAll({
      status,
      categoryId,
      page,
      limit,
    });
  }

  @Post('admin/movies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new movie (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Movie created' })
  createMovie(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body()
    body: {
      title: string;
      description?: string;
      videoUrl: string;
      poster?: string;
      thumbnail?: string;
      duration?: string;
      categoryId?: string;
      tags?: string[];
      status?: PostStatus;
    },
  ) {
    return this.moviesService.create(userId, role, body);
  }

  @Patch('admin/movies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update movie (Admin/Staff only)' })
  updateMovie(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body()
    body: {
      title?: string;
      description?: string;
      videoUrl?: string;
      poster?: string;
      thumbnail?: string;
      duration?: string;
      categoryId?: string;
      tags?: string[];
      status?: PostStatus;
    },
  ) {
    return this.moviesService.update(id, userId, role, body);
  }

  @Delete('admin/movies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete movie (Admin/Staff only)' })
  deleteMovie(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.moviesService.delete(id, userId, role);
  }
}
