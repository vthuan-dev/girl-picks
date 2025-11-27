import { Module } from '@nestjs/common';
import { GirlsService } from './girls.service';
import { GirlsController } from './girls.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GirlsController],
  providers: [GirlsService],
  exports: [GirlsService],
})
export class GirlsModule {}

