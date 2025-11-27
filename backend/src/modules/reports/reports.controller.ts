import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a report' })
  @ApiResponse({ status: 201, description: 'Report created' })
  create(@CurrentUser('id') userId: string, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(userId, createReportDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my reports' })
  @ApiResponse({ status: 200, description: 'List of my reports' })
  findMyReports(@CurrentUser('id') userId: string) {
    return this.reportsService.findMyReports(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report details' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }
}

