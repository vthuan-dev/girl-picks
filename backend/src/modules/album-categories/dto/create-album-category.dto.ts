import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAlbumCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  isActive?: boolean = true;

  @IsOptional()
  order?: number = 0;
}
