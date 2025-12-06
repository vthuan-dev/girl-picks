import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BlockedDatesService } from './blocked-dates.service';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Blocked Dates')
@ApiBearerAuth()
@Controller('blocked-dates')
@UseGuards(JwtAuthGuard)
export class BlockedDatesController {
  constructor(private readonly blockedDatesService: BlockedDatesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Block a date (Girl only)' })
  @ApiResponse({ status: 201, description: 'Date blocked' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createBlockedDateDto: CreateBlockedDateDto,
  ) {
    return this.blockedDatesService.create(userId, createBlockedDateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blocked dates' })
  @ApiResponse({ status: 200, description: 'List of blocked dates' })
  findAll(@Query('girlId') girlId?: string) {
    return this.blockedDatesService.findAll(girlId);
  }

  @Get('girl/:girlId')
  @ApiOperation({ summary: 'Get blocked dates by girl ID' })
  @ApiResponse({ status: 200, description: 'List of blocked dates for girl' })
  findGirlBlockedDates(@Param('girlId') girlId: string) {
    return this.blockedDatesService.findAll(girlId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blocked date by ID' })
  @ApiResponse({ status: 200, description: 'Blocked date details' })
  @ApiResponse({ status: 404, description: 'Blocked date not found' })
  findOne(@Param('id') id: string) {
    return this.blockedDatesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Unblock a date (Girl only)' })
  @ApiResponse({ status: 200, description: 'Date unblocked' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.blockedDatesService.remove(id, userId);
  }
}
