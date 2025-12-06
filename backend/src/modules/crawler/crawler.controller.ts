import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CrawlerService } from './crawler.service';

@ApiTags('Crawler')
@Controller('crawler')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post('save')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Save crawled girl data to database' })
  @ApiResponse({ status: 200, description: 'Girl saved successfully' })
  async saveGirl(@Body() data: any) {
    const result = await this.crawlerService.saveGirl(data);
    return {
      success: true,
      message: result.message,
      isNew: result.isNew,
      data: result.girl,
    };
  }
}

