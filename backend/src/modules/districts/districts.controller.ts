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
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Districts')
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create district (Admin only)' })
  @ApiResponse({ status: 201, description: 'District created' })
  create(@Body() createDistrictDto: CreateDistrictDto) {
    return this.districtsService.create(createDistrictDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all districts (public)' })
  @ApiQuery({ name: 'province', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of districts' })
  findAll(@Query('province') province?: string, @Query('isActive') isActive?: string) {
    return this.districtsService.findAll(
      province,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Get('provinces')
  @Public()
  @ApiOperation({ summary: 'Get all provinces (public)' })
  @ApiResponse({ status: 200, description: 'List of provinces' })
  getProvinces() {
    return this.districtsService.getProvinces();
  }

  @Get('province/:province')
  @Public()
  @ApiOperation({ summary: 'Get districts by province (public)' })
  @ApiResponse({ status: 200, description: 'List of districts' })
  findByProvince(@Param('province') province: string) {
    return this.districtsService.findByProvince(province);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get district by ID (public)' })
  @ApiResponse({ status: 200, description: 'District details' })
  findOne(@Param('id') id: string) {
    return this.districtsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update district (Admin only)' })
  @ApiResponse({ status: 200, description: 'District updated' })
  update(@Param('id') id: string, @Body() updateDistrictDto: UpdateDistrictDto) {
    return this.districtsService.update(id, updateDistrictDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete district (Admin only)' })
  @ApiResponse({ status: 200, description: 'District deleted' })
  remove(@Param('id') id: string) {
    return this.districtsService.remove(id);
  }
}

