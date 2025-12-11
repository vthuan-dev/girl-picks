import { IsArray, IsString } from 'class-validator';

export class AddImagesDto {
  @IsArray()
  @IsString({ each: true })
  images: string[];
}

