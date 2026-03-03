import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query, Request 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { PopupsService } from './popups.service';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('popups')
@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create popup (Admin only)' })
  create(@Body() createDto: CreatePopupDto, @Request() req) {
    return this.popupsService.create(createDto, req.user.id);
  }

  @Post('initialize-system')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize system popups (Admin only)' })
  async initializeSystem(@Request() req) {
    await this.popupsService.initializeSystemPopups(req.user.id);
    return { message: 'System popups initialized successfully' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all popups (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['welcome', 'trial_info', 'subscription_expiry', 'subscription_success', 'payment_success', 'payment_failed', 'maintenance', 'update_available', 'feature_announcement', 'promotional', 'custom'] })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'active', 'scheduled', 'expired', 'paused'] })
  @ApiQuery({ name: 'targetAudience', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: any,
    @Query('status') status?: any,
    @Query('targetAudience') targetAudience?: any,
    @Query('search') search?: string,
  ) {
    return this.popupsService.findAll(page, limit, type, status, targetAudience, search);
  }

  @Get('user')
  @Public()
  @ApiOperation({ summary: 'Get popups for user (Flutter app)' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'isVerified', required: true })
  @ApiQuery({ name: 'subscriptionStatus', required: true })
  @ApiQuery({ name: 'isNewUser', required: false })
  @ApiQuery({ name: 'isTrialUser', required: false })
  async getUserPopups(
    @Query('userId') userId: string,
    @Query('isVerified') isVerified: string,
    @Query('subscriptionStatus') subscriptionStatus: string,
    @Query('isNewUser') isNewUser?: string,
    @Query('isTrialUser') isTrialUser?: string,
  ) {
    const popups = await this.popupsService.getUserPopups(
      userId,
      isVerified === 'true',
      subscriptionStatus,
      isNewUser === 'true',
      isTrialUser === 'true'
    );
    
    // Track views
    popups.forEach(p => this.popupsService.trackView(p.id));
    
    return popups;
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: 'Track popup view' })
  @ApiParam({ name: 'id' })
  async trackView(@Param('id') id: string) {
    await this.popupsService.trackView(id);
    return { success: true };
  }

  @Post(':id/click')
  @Public()
  @ApiOperation({ summary: 'Track popup click' })
  @ApiParam({ name: 'id' })
  async trackClick(@Param('id') id: string) {
    await this.popupsService.trackClick(id);
    return { success: true };
  }

  @Post(':id/close')
  @Public()
  @ApiOperation({ summary: 'Track popup close' })
  @ApiParam({ name: 'id' })
  async trackClose(@Param('id') id: string) {
    await this.popupsService.trackClose(id);
    return { success: true };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get popup by ID (Admin only)' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.popupsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update popup (Admin only)' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePopupDto, @Request() req) {
    return this.popupsService.update(id, updateDto, req.user.id);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle popup status (Admin only)' })
  @ApiParam({ name: 'id' })
  toggleStatus(@Param('id') id: string, @Request() req) {
    return this.popupsService.toggleStatus(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete popup (Admin only)' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    await this.popupsService.remove(id);
    return { message: 'Popup deleted successfully' };
  }
}