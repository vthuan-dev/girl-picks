import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Venues')
@ApiBearerAuth()
@Controller('venues')
@UseGuards(JwtAuthGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GIRL)
  @ApiOperation({ summary: 'Create a new venue (Admin or Girl)' })
  @ApiResponse({ status: 201, description: 'Venue created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createVenueDto: CreateVenueDto) {
    return this.venuesService.create(createVenueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all venues' })
  @ApiResponse({ status: 200, description: 'List of venues' })
  findAll(
    @Query('districtId') districtId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.venuesService.findAll(
      districtId,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search venues by location' })
  @ApiResponse({ status: 200, description: 'List of venues near location' })
  searchByLocation(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius?: string,
  ) {
    return this.venuesService.searchByLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 5,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue by ID' })
  @ApiResponse({ status: 200, description: 'Venue details' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update venue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Venue updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    return this.venuesService.update(id, updateVenueDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete venue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Venue deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
