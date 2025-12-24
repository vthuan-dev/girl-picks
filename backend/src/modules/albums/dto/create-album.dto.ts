import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  albumCategoryId?: string;

  @IsOptional()
  tags?: any;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}
