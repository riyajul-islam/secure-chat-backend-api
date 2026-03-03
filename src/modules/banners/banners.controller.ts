import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerResponseDto } from './dto/banner-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new banner (Admin only)' })
  @ApiResponse({ status: 201, description: 'Banner created successfully', type: BannerResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all banners (Public)' })
  @ApiResponse({ status: 200, description: 'Return all banners', type: [BannerResponseDto] })
  findAll() {
    return this.bannersService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active banners (Public)' })
  @ApiResponse({ status: 200, description: 'Return active banners', type: [BannerResponseDto] })
  getActiveBanners() {
    return this.bannersService.getActiveBanners();
  }

  @Get('position/:position')
  @Public()
  @ApiOperation({ summary: 'Get banners by position (Public)' })
  @ApiParam({ name: 'position', description: 'Banner position', enum: ['Dashboard Screen', 'Investment Screen', 'Funds Screen', 'News Screen', 'Transaction History Screen', 'Settings Screen', 'Security Settings Screen'] })
  @ApiResponse({ status: 200, description: 'Return banners for the position', type: [BannerResponseDto] })
  findByPosition(@Param('position') position: string) {
    return this.bannersService.findByPosition(position);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a banner by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Return the banner', type: BannerResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a banner (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner updated successfully', type: BannerResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle banner status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner status toggled', type: BannerResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  toggleStatus(@Param('id') id: string) {
    return this.bannersService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a banner (Admin only)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async remove(@Param('id') id: string) {
    await this.bannersService.remove(id);
    return { message: 'Banner deleted successfully' };
  }
}
