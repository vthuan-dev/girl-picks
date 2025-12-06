import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddGirlImagesDto {
  @ApiProperty({
    description: 'Image URLs to add',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  imageUrls: string[];
}

export class RemoveGirlImageDto {
  @ApiProperty({
    description: 'Specific image URL to remove',
  })
  @IsString()
  imageUrl: string;
}
