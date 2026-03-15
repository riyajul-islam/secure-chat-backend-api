import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RealTimeStatsService } from './real-time-stats.service';
import { SecurityMonitoringService } from './security-monitoring.service';
import { GeoLocationService } from './geo-location.service';
import { DeviceAnalyticsService } from './device-analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private readonly realTimeStats: RealTimeStatsService,
    private readonly securityMonitoring: SecurityMonitoringService,
    private readonly geoLocation: GeoLocationService,
    private readonly deviceAnalytics: DeviceAnalyticsService,
  ) { }

  @Get('realtime')
  @ApiOperation({ summary: 'Get real-time server stats' })
  async getRealTimeStats() {
    return this.realTimeStats.getCurrentStats();
  }

  @Get('users/growth')
  @ApiOperation({ summary: 'Get user growth statistics' })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month', 'year'] })
  async getUserGrowth(@Query('period') period: string = 'month') {
    // Implementation with date ranges
    return { message: 'User growth data' };
  }

  @Get('users/active')
  @ApiOperation({ summary: 'Get active user counts' })
  async getActiveUsers() {
    return {
      last1min: await this.realTimeStats['getActiveUsers'](1),
      last5min: await this.realTimeStats['getActiveUsers'](5),
      last15min: await this.realTimeStats['getActiveUsers'](15),
      last1hour: await this.realTimeStats['getActiveUsers'](60)
    };
  }

  @Get('calls/active')
  @ApiOperation({ summary: 'Get active calls count' })
  async getActiveCalls() {
    return {
      total: await this.realTimeStats['currentStats']?.active_calls || 0,
      audio: await this.realTimeStats['currentStats']?.active_audio_calls || 0,
      video: await this.realTimeStats['currentStats']?.active_video_calls || 0,
      group: await this.realTimeStats['currentStats']?.active_group_calls || 0
    };
  }

  @Get('messages/rate')
  @ApiOperation({ summary: 'Get messages per second' })
  async getMessageRate() {
    return {
      messagesPerSecond: await this.realTimeStats['getMessagesPerSecond']()
    };
  }

  @Get('geographic/distribution')
  @ApiOperation({ summary: 'Get user distribution by country' })
  async getGeographicDistribution() {
    return this.geoLocation.getUserDistribution();
  }

  @Get('geographic/map')
  @ApiOperation({ summary: 'Get geo map data' })
  async getGeoMapData() {
    return this.geoLocation.getGeoMapData();
  }

  @Get('geographic/active')
  @ApiOperation({ summary: 'Get active sessions by country' })
  async getActiveSessionsByCountry() {
    return this.geoLocation.getActiveSessionsByCountry();
  }

  @Get('devices/distribution')
  @ApiOperation({ summary: 'Get device/platform distribution' })
  async getDeviceDistribution() {
    return this.deviceAnalytics.getDeviceDistribution();
  }

  @Get('devices/os-versions')
  @ApiOperation({ summary: 'Get OS version distribution' })
  async getOSVersions() {
    return this.deviceAnalytics.getOSVersions();
  }

  @Get('devices/app-versions')
  @ApiOperation({ summary: 'Get app version distribution' })
  async getAppVersions() {
    return this.deviceAnalytics.getAppVersions();
  }

  @Get('devices/models')
  @ApiOperation({ summary: 'Get device models' })
  async getDeviceModels() {
    return this.deviceAnalytics.getDeviceModels();
  }

  @Get('security/events/recent')
  @ApiOperation({ summary: 'Get recent security events' })
  async getRecentSecurityEvents(@Query('limit') limit: number = 100) {
    return this.securityMonitoring.getRecentSecurityEvents(limit);
  }

  @Get('security/events/stats')
  @ApiOperation({ summary: 'Get security event statistics' })
  async getSecurityStats() {
    return this.securityMonitoring.getAttackStats();
  }

  @Get('security/blocked-ips')
  @ApiOperation({ summary: 'Get blocked IPs' })
  async getBlockedIPs(@Query('activeOnly') activeOnly: boolean = true) {
    return this.securityMonitoring.getBlockedIPs(activeOnly);
  }

  @Post('security/block/:ip')
  @ApiOperation({ summary: 'Manually block an IP' })
  async blockIP(
    @Param('ip') ip: string,
    @Query('reason') reason: string,
    @Query('duration') duration?: number
  ) {
    // This would need admin ID from request
    return this.securityMonitoring.blockIp(
      ip,
      'manual_block' as any,
      reason,
      duration
    );
  }

  @Post('security/unblock/:id')
  @ApiOperation({ summary: 'Unblock an IP' })
  async unblockIP(@Param('id') id: string, @Query('reason') reason: string) {
    // This would need admin ID from request
    return this.securityMonitoring.unblockIp(id, 'admin', reason);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics' })
  async getPerformanceMetrics() {
    return {
      cpu: {
        usage: this.realTimeStats['currentStats']?.cpu_usage_percent || 0,
        load1: this.realTimeStats['currentStats']?.cpu_load_1min || 0,
        load5: this.realTimeStats['currentStats']?.cpu_load_5min || 0,
        load15: this.realTimeStats['currentStats']?.cpu_load_15min || 0
      },
      memory: {
        total: this.realTimeStats['currentStats']?.memory_total || 0,
        used: this.realTimeStats['currentStats']?.memory_used || 0,
        free: this.realTimeStats['currentStats']?.memory_free || 0,
        usagePercent: this.realTimeStats['currentStats']?.memory_usage_percent || 0
      },
      storage: {
        total: this.realTimeStats['currentStats']?.storage_total || 0,
        used: this.realTimeStats['currentStats']?.storage_used || 0,
        free: this.realTimeStats['currentStats']?.storage_free || 0,
        usagePercent: this.realTimeStats['currentStats']?.storage_usage_percent || 0
      },
      responseTime: this.realTimeStats['currentStats']?.average_response_time_ms || 0,
      errorRate: this.realTimeStats['currentStats']?.error_rate_percent || 0
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get historical stats by date range' })
  @ApiQuery({ name: 'range', enum: ['today', 'yesterday', 'last7days', 'last15days', 'last30days', 'last90days', 'custom'], required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getHistoryStats(
    @Query('range') range: string = 'last7days',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let timeRange: { start: Date; end: Date };
    
    if (range === 'custom' && startDate && endDate) {
      timeRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    } else {
      timeRange = this.realTimeStats.getDateRangeFromString(range);
    }
    
    return this.realTimeStats.getHistoryStats(timeRange);
  }

  @Get('history/daily')
  @ApiOperation({ summary: 'Get daily breakdown' })
  @ApiQuery({ name: 'range', enum: ['last7days', 'last15days', 'last30days'], required: false })
  async getDailyBreakdown(
    @Query('range') range: string = 'last7days',
  ) {
    const timeRange = this.realTimeStats.getDateRangeFromString(range);
    return this.realTimeStats.getDailyBreakdown(timeRange.start, timeRange.end);
    }

  @Post('refresh')
  @ApiOperation({ summary: 'Manually refresh real-time stats' })
  async refreshStats() {
    console.log('🔄 Manual refresh requested at:', new Date().toISOString());
    return this.realTimeStats.refreshMetricsManually();
  }
  

}