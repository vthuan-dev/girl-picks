import { IsInt, IsOptional, IsString, Min, Max, MaxLength, IsArray } from 'class-validator';

export class CreateChatSexReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comment?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsString()
    @MaxLength(100)
    userName?: string;
}
