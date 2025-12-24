import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { AddImagesDto } from './dto/add-images.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  // Public list
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('category') category?: string,
  ) {
    return this.albumsService.findAll(
      Number(page) || 1,
      Number(limit) || 20,
      category,
    );
  }

  // Public detail
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(id);
  }

  // Admin create album
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  create(@Body() dto: CreateAlbumDto, @CurrentUser('id') userId: string) {
    return this.albumsService.create(dto, userId);
  }

  // Admin add images to album
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  addImages(@Param('id') id: string, @Body() dto: AddImagesDto) {
    return this.albumsService.addImages(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  remove(@Param('id') id: string) {
    return this.albumsService.deleteAlbum(id);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF_UPLOAD)
  removeImage(@Param('imageId') imageId: string) {
    return this.albumsService.deleteImage(imageId);
  }
}
