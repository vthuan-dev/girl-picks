import { Module } from '@nestjs/common';
import { ChatSexService } from './chat-sex.service';
import { ChatSexController } from './chat-sex.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatSexController],
  providers: [ChatSexService],
  exports: [ChatSexService],
})
export class ChatSexModule {}

