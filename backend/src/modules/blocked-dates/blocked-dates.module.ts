import { Module } from '@nestjs/common';
import { BlockedDatesService } from './blocked-dates.service';
import { BlockedDatesController } from './blocked-dates.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BlockedDatesController],
  providers: [BlockedDatesService],
  exports: [BlockedDatesService],
})
export class BlockedDatesModule {}

