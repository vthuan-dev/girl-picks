import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AlbumCategoriesModule } from '../album-categories/album-categories.module';

@Module({
  imports: [AlbumCategoriesModule],
  controllers: [AlbumsController],
  providers: [AlbumsService, PrismaService],
})
export class AlbumsModule {}
