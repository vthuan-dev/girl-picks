import { Module, forwardRef } from '@nestjs/common';
import { GirlsService } from './girls.service';
import { GirlsController } from './girls.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, CacheModule, forwardRef(() => NotificationsModule)],
  controllers: [GirlsController],
  providers: [GirlsService],
  exports: [GirlsService],
})
export class GirlsModule { }
