import { PartialType } from '@nestjs/swagger';
import { CreateChatSexGirlDto } from './create-chat-sex-girl.dto';

export class UpdateChatSexGirlDto extends PartialType(CreateChatSexGirlDto) {}

