import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query, Request 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create notification (Admin only)' })
  async create(@Body() createDto: CreateNotificationDto, @Request() req) {
    return await this.notificationsService.create(createDto, req.user.id);
  }

  @Post('initialize-auto')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize auto notifications (Admin only)' })
  async initializeAuto(@Request() req) {
    await this.notificationsService.initializeAutoNotifications(req.user.id);
    return { message: 'Auto notifications initialized successfully' };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'targetAudience', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'showSystem', required: false, type: Boolean })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('targetAudience') targetAudience?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('showSystem') showSystem?: string,
  ) {
    const showSystemBool = showSystem === 'true';
    return await this.notificationsService.findAll(
      page, limit, type as any, status as any, targetAudience, search, dateFrom, dateTo, showSystemBool
    );
  }

  @Get('user')
  @Public()
  @ApiOperation({ summary: 'Get notifications for user (Flutter app)' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'isVerified', required: true })
  @ApiQuery({ name: 'subscriptionStatus', required: true })
  @ApiQuery({ name: 'isNewUser', required: false })
  @ApiQuery({ name: 'isTrialUser', required: false })
  async getUserNotifications(
    @Query('userId') userId: string,
    @Query('isVerified') isVerified: string,
    @Query('subscriptionStatus') subscriptionStatus: string,
    @Query('isNewUser') isNewUser?: string,
    @Query('isTrialUser') isTrialUser?: string,
  ) {
    const notifications = await this.notificationsService.getUserNotifications(
      userId,
      isVerified === 'true',
      subscriptionStatus,
      isNewUser === 'true',
      isTrialUser === 'true'
    );
    
    // Track views
    notifications.forEach(n => this.notificationsService.trackView(n.id));
    
    return notifications;
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: 'Track notification view' })
  @ApiParam({ name: 'id' })
  async trackView(@Param('id') id: string) {
    await this.notificationsService.trackView(id);
    return { success: true };
  }

  @Post(':id/click')
  @Public()
  @ApiOperation({ summary: 'Track notification click' })
  @ApiParam({ name: 'id' })
  async trackClick(@Param('id') id: string) {
    await this.notificationsService.trackClick(id);
    return { success: true };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification by ID (Admin only)' })
  @ApiParam({ name: 'id' })
  async findOne(@Param('id') id: string) {
    return await this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification (Admin only)' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateNotificationDto, @Request() req) {
    return await this.notificationsService.update(id, updateDto, req.user.id);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle notification status (Admin only)' })
  @ApiParam({ name: 'id' })
  async toggleStatus(@Param('id') id: string, @Request() req) {
    return await this.notificationsService.toggleStatus(id, req.user.id);
  }

  @Patch(':id/toggle-system')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle system visibility (Admin only)' })
  @ApiParam({ name: 'id' })
  async toggleSystem(@Param('id') id: string, @Request() req) {
    return await this.notificationsService.toggleSystemVisibility(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete notification (Admin only)' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    await this.notificationsService.remove(id);
    return { message: 'Notification deleted successfully' };
  }
}