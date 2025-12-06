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
import { ServicePackagesService } from './service-packages.service';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { UpdateServicePackageDto } from './dto/update-service-package.dto';
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

@ApiTags('Service Packages')
@ApiBearerAuth()
@Controller('service-packages')
@UseGuards(JwtAuthGuard)
export class ServicePackagesController {
  constructor(
    private readonly servicePackagesService: ServicePackagesService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Create a new service package (Girl only)' })
  @ApiResponse({ status: 201, description: 'Service package created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createServicePackageDto: CreateServicePackageDto,
  ) {
    return this.servicePackagesService.create(userId, createServicePackageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service packages' })
  @ApiResponse({ status: 200, description: 'List of service packages' })
  findAll(
    @Query('girlId') girlId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.servicePackagesService.findAll(
      girlId,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Get('girl/:girlId')
  @ApiOperation({ summary: 'Get service packages by girl ID' })
  @ApiResponse({
    status: 200,
    description: 'List of service packages for girl',
  })
  findGirlPackages(@Param('girlId') girlId: string) {
    return this.servicePackagesService.findAll(girlId, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service package by ID' })
  @ApiResponse({ status: 200, description: 'Service package details' })
  @ApiResponse({ status: 404, description: 'Service package not found' })
  findOne(@Param('id') id: string) {
    return this.servicePackagesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Update service package (Girl only)' })
  @ApiResponse({ status: 200, description: 'Service package updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateServicePackageDto: UpdateServicePackageDto,
  ) {
    return this.servicePackagesService.update(
      id,
      userId,
      updateServicePackageDto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Delete service package (Girl only)' })
  @ApiResponse({ status: 200, description: 'Service package deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.servicePackagesService.remove(id, userId);
  }
}
