import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatSexGirlDto {
  @ApiProperty({ description: 'Tên gái chat sex' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Title từ crawler' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Tuổi' })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(60)
  age?: number;

  @ApiPropertyOptional({ description: 'Năm sinh' })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2010)
  birthYear?: number;

  @ApiPropertyOptional({ description: 'Chiều cao (ví dụ: "158cm")' })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({ description: 'Cân nặng (ví dụ: "47kg")' })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional({ description: 'Mô tả/Bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Zalo ID' })
  @IsOptional()
  @IsString()
  zalo?: string;

  @ApiPropertyOptional({ description: 'Telegram ID' })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiPropertyOptional({ description: 'Địa điểm' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Tỉnh/Thành phố' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ đầy đủ' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Giá (ví dụ: "15", "500k")' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'Giá 15 phút (ví dụ: "200K")' })
  @IsOptional()
  @IsString()
  price15min?: string;

  @ApiPropertyOptional({ description: 'Thông tin thanh toán (ví dụ: "Teckcombank 9022")' })
  @IsOptional()
  @IsString()
  paymentInfo?: string;

  @ApiPropertyOptional({ description: 'Dịch vụ', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ description: 'Giờ làm việc (ví dụ: "24/7", "9h-2h tối")' })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiPropertyOptional({ description: 'Hướng dẫn' })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional({ description: 'URL ảnh', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'URL video', type: [String] })
  @IsOptional()
  @IsArray()
  videos?: any[];

  @ApiPropertyOptional({ description: 'Ảnh cover (ảnh đầu tiên)' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Đã verified' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Featured' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Đang active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Đang available' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Rating' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'URL nguồn từ crawler' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;
}

