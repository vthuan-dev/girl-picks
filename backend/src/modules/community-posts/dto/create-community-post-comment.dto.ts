import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityPostCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
