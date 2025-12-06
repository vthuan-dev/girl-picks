import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;
}
