import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;
}

