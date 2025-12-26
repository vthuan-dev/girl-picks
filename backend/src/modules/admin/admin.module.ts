import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SettingsController } from './settings.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ReviewsModule), NotificationsModule],
  controllers: [AdminController, SettingsController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
