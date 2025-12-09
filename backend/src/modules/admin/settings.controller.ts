import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  @Get('public/:key')
  @ApiOperation({ summary: 'Get public setting by key' })
  @ApiResponse({ status: 200, description: 'Setting value' })
  async getPublicSetting(@Param('key') key: string) {
    // Only allow certain keys to be accessed publicly
    const allowedKeys = ['rulesContent', 'termsContent', 'privacyContent', 'siteName', 'siteDescription'];
    
    if (!allowedKeys.includes(key)) {
      return { value: null };
    }

    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });

    return { value: setting?.value || null };
  }
}
