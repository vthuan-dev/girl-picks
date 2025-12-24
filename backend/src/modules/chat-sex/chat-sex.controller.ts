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
  Request,
} from '@nestjs/common';
import { ChatSexService } from './chat-sex.service';
import { CreateChatSexGirlDto } from './dto/create-chat-sex-girl.dto';
import { UpdateChatSexGirlDto } from './dto/update-chat-sex-girl.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Chat Sex')
@Controller('chat-sex')
export class ChatSexController {
  constructor(private readonly chatSexService: ChatSexService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create chat sex girl (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Chat sex girl created' })
  create(
    @Body() createDto: CreateChatSexGirlDto,
    @CurrentUser('id') managedById: string,
  ) {
    return this.chatSexService.create(createDto, managedById);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create chat sex girls (Admin/Staff only)' })
  @ApiResponse({ status: 201, description: 'Chat sex girls created' })
  bulkCreate(
    @Body() dtos: CreateChatSexGirlDto[],
    @CurrentUser('id') managedById: string,
  ) {
    return this.chatSexService.bulkCreate(dtos, managedById);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all chat sex girls (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'province', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of chat sex girls' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('search') search?: string,
    @Query('province') province?: string,
    @Query('isActive') isActive?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('isVerified') isVerified?: string,
  ) {
    try {
      return await this.chatSexService.findAll({
        page,
        limit,
        search,
        province,
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        isFeatured:
          isFeatured === 'true'
            ? true
            : isFeatured === 'false'
              ? false
              : undefined,
        isVerified:
          isVerified === 'true'
            ? true
            : isVerified === 'false'
              ? false
              : undefined,
      });
    } catch (error) {
      console.error('Error in chat-sex findAll:', error);
      throw error;
    }
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get chat sex girl by ID (public)' })
  @ApiResponse({ status: 200, description: 'Chat sex girl details' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.chatSexService.findOne(id);
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: 'Increment view count (public)' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  incrementView(@Param('id') id: string) {
    return this.chatSexService.incrementViewCount(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update chat sex girl (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Chat sex girl updated' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChatSexGirlDto,
    @CurrentUser('id') managedById: string,
  ) {
    return this.chatSexService.update(id, updateDto, managedById);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete chat sex girl (Admin/Staff only)' })
  @ApiResponse({ status: 200, description: 'Chat sex girl deleted' })
  remove(@Param('id') id: string, @CurrentUser('id') managedById: string) {
    return this.chatSexService.remove(id, managedById);
  }

  // ==================== Review Endpoints ====================

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for a chat sex girl' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getReviews(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.chatSexService.getReviews(id, parseInt(page), parseInt(limit));
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Create a review for a chat sex girl' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiBody({ type: Object }) // Should be CreateChatSexReviewDto
  createReview(
    @Param('id') id: string,
    @Body() dto: any,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id; // Optional: get from JWT if logged in
    return this.chatSexService.createReview(id, dto, userId);
  }
}
