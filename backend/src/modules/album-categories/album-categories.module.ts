import { Module } from '@nestjs/common';
import { AlbumCategoriesService } from './album-categories.service';
import { AlbumCategoriesController } from './album-categories.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AlbumCategoriesController],
  providers: [AlbumCategoriesService, PrismaService],
  exports: [AlbumCategoriesService],
})
export class AlbumCategoriesModule {}

