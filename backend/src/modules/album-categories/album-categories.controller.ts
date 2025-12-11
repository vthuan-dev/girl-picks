   import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AlbumCategoriesService } from './album-categories.service';
import { CreateAlbumCategoryDto } from './dto/create-album-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('album-categories')
export class AlbumCategoriesController {
  constructor(private readonly service: AlbumCategoriesService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    const activeOnly = includeInactive ? false : true;
    return this.service.findAll(activeOnly);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF_UPLOAD')
  create(@Body() dto: CreateAlbumCategoryDto) {
    return this.service.create(dto);
  }
}

