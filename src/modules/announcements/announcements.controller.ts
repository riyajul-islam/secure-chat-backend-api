import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards, Query, Request
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
    ApiQuery, ApiParam
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create announcement (Admin only)' })
    create(@Body() createDto: CreateAnnouncementDto, @Request() req) {
        return this.announcementsService.create(createDto, req.user.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all announcements (Admin only)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'targetAudience', required: false, enum: ['all_users', 'verified_users', 'unverified_users', 'active_subscribers', 'inactive_subscribers', 'expired_subscribers'] })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'dateFrom', required: false })
    @ApiQuery({ name: 'dateTo', required: false })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('targetAudience') targetAudience?: any,
        @Query('search') search?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
    ) {
        return this.announcementsService.findAll(page, limit, targetAudience, search, dateFrom, dateTo);
    }

    @Get('user')
    @Public()
    @ApiOperation({ summary: 'Get announcements for user (Flutter app)' })
    @ApiQuery({ name: 'userId', required: true })
    @ApiQuery({ name: 'isVerified', required: true })
    @ApiQuery({ name: 'subscriptionStatus', required: true })
    async getUserAnnouncements(
        @Query('userId') userId: string,
        @Query('isVerified') isVerified: string,
        @Query('subscriptionStatus') subscriptionStatus: string,
    ) {
        const announcements = await this.announcementsService.getUserAnnouncements(
            userId,
            isVerified === 'true',
            subscriptionStatus
        );

        // Increment view count for each announcement
        announcements.forEach(a => this.announcementsService.incrementViewCount(a.id));

        return announcements;
    }

    @Post(':id/click')
    @Public()
    @ApiOperation({ summary: 'Track click on learn more button' })
    @ApiParam({ name: 'id' })
    async trackClick(@Param('id') id: string) {
        await this.announcementsService.incrementClickCount(id);
        return { success: true };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get announcement by ID (Admin only)' })
    @ApiParam({ name: 'id' })
    findOne(@Param('id') id: string) {
        return this.announcementsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update announcement (Admin only)' })
    @ApiParam({ name: 'id' })
    update(@Param('id') id: string, @Body() updateDto: UpdateAnnouncementDto, @Request() req) {
        return this.announcementsService.update(id, updateDto, req.user.id);
    }

    @Patch(':id/toggle-status')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle announcement status (Admin only)' })
    @ApiParam({ name: 'id' })
    toggleStatus(@Param('id') id: string, @Request() req) {
        return this.announcementsService.toggleStatus(id, req.user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete announcement (Admin only)' })
    @ApiParam({ name: 'id' })
    async remove(@Param('id') id: string) {
        await this.announcementsService.remove(id);
        return { message: 'Announcement deleted successfully' };
    }
}