import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':girlId')
  @ApiOperation({ summary: 'Add girl to favorites' })
  @ApiResponse({ status: 201, description: 'Added to favorites' })
  add(@CurrentUser('id') userId: string, @Param('girlId') girlId: string) {
    return this.favoritesService.add(userId, girlId);
  }

  @Delete(':girlId')
  @ApiOperation({ summary: 'Remove girl from favorites' })
  @ApiResponse({ status: 200, description: 'Removed from favorites' })
  remove(@CurrentUser('id') userId: string, @Param('girlId') girlId: string) {
    return this.favoritesService.remove(userId, girlId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all favorites' })
  @ApiResponse({ status: 200, description: 'List of favorites' })
  findAll(@CurrentUser('id') userId: string) {
    return this.favoritesService.findAll(userId);
  }

  @Get('check/:girlId')
  @ApiOperation({ summary: 'Check if girl is favorited' })
  @ApiResponse({ status: 200, description: 'Favorite status' })
  isFavorited(@CurrentUser('id') userId: string, @Param('girlId') girlId: string) {
    return this.favoritesService.isFavorited(userId, girlId);
  }
}

