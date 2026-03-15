import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { AnalyticsEvent, EventType, PlatformType } from './entities/analytics.entity';
import { SecurityEvent, SecurityEventType, SecurityLevel } from './entities/security-event.entity';
import { ServerMetrics } from './entities/server-metrics.entity';
import { BlockedIP, BlockReason, BlockAction } from './entities/blocked-ip.entity'; // Add BlockAction
import * as os from 'os';
import * as disk from 'diskusage';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private currentMetrics: any = {};

  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
    @InjectRepository(SecurityEvent)
    private securityRepository: Repository<SecurityEvent>,
    @InjectRepository(ServerMetrics)
    private metricsRepository: Repository<ServerMetrics>,
    @InjectRepository(BlockedIP)
    private blockedIpRepository: Repository<BlockedIP>,
  ) { }

  // ==================== REAL-TIME STATS ====================

  async getRealTimeStats(): Promise<any> {
    try {
      const now = new Date();

      // Get active users
      const [active1min, active5min, active15min] = await Promise.all([
        this.getActiveUsers(1),
        this.getActiveUsers(5),
        this.getActiveUsers(15),
      ]);

      // Get active calls
      const activeCalls = await this.getActiveCalls();

      // Get message rate
      const messagesPerSecond = await this.getMessagesPerSecond();

      // Get server metrics
      const serverMetrics = await this.getServerMetrics();

      return {
        timestamp: now,
        users: {
          active1min,
          active5min,
          active15min,
        },
        calls: activeCalls,
        messagesPerSecond,
        server: serverMetrics,
        security: await this.getSecuritySummary(),
      };
    } catch (error) {
      this.logger.error('Error getting real-time stats:', error);
      return {
        timestamp: new Date(),
        users: { active1min: 0, active5min: 0, active15min: 0 },
        calls: { total: 0, audio: 0, video: 0, group: 0 },
        messagesPerSecond: 0,
        server: null,
        security: { events: { lastHour: 0, lastDay: 0, total: 0 }, blockedIPs: 0 },
      };
    }
  }

  async getActiveUsers(minutes: number = 5): Promise<number> {
    try {
      const timeAgo = new Date(Date.now() - minutes * 60 * 1000);

      const result = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('COUNT(DISTINCT hashed_user_id)', 'count')
        .where('timestamp > :time', { time: timeAgo })
        .andWhere('hashed_user_id IS NOT NULL')
        .getRawOne();

      return parseInt(result?.count) || 0;
    } catch (error) {
      this.logger.error(`Error getting active users:`, error);
      return 0;
    }
  }

  async getActiveCalls(): Promise<any> {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      const [audio, video, group] = await Promise.all([
        this.analyticsRepository.count({
          where: {
            event_type: EventType.AUDIO_CALL_START,
            timestamp: MoreThan(fiveMinAgo),
          },
        }),
        this.analyticsRepository.count({
          where: {
            event_type: EventType.VIDEO_CALL_START,
            timestamp: MoreThan(fiveMinAgo),
          },
        }),
        this.analyticsRepository.count({
          where: {
            event_type: EventType.GROUP_CALL_START,
            timestamp: MoreThan(fiveMinAgo),
          },
        }),
      ]);

      return {
        total: audio + video + group,
        audio,
        video,
        group,
      };
    } catch (error) {
      this.logger.error('Error getting active calls:', error);
      return { total: 0, audio: 0, video: 0, group: 0 };
    }
  }

  async getMessagesPerSecond(): Promise<number> {
    try {
      const oneMinAgo = new Date(Date.now() - 60 * 1000);

      const count = await this.analyticsRepository.count({
        where: {
          event_type: EventType.MESSAGE_SENT,
          timestamp: MoreThan(oneMinAgo),
        },
      });

      return Math.round(count / 60);
    } catch (error) {
      this.logger.error('Error getting messages per second:', error);
      return 0;
    }
  }

  async getServerMetrics(): Promise<any> {
    try {
      // CPU Info
      const cpus = os.cpus();
      const loadAvg = os.loadavg();

      // Calculate CPU usage
      let totalIdle = 0;
      let totalTick = 0;
      cpus.forEach(cpu => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      const cpuUsage = totalTick > 0 ? 100 - (totalIdle / totalTick) * 100 : 0;

      // Memory Info
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsage = totalMem > 0 ? (usedMem / totalMem) * 100 : 0;

      // Storage Info
      let storageTotal = 0, storageFree = 0, storageUsage = 0;
      try {
        const diskInfo = await disk.check('/');
        storageTotal = diskInfo.total;
        storageFree = diskInfo.free;
        const storageUsed = storageTotal - storageFree;
        storageUsage = storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0;
      } catch (error) {
        this.logger.error('Error getting disk info:', error);
      }

      return {
        cpu: {
          usage: parseFloat(cpuUsage.toFixed(2)),
          load1: parseFloat(loadAvg[0].toFixed(2)),
          load5: parseFloat(loadAvg[1].toFixed(2)),
          load15: parseFloat(loadAvg[2].toFixed(2)),
          cores: cpus.length,
        },
        memory: {
          total: totalMem,
          used: usedMem,
          free: freeMem,
          usagePercent: parseFloat(memUsage.toFixed(2)),
        },
        storage: {
          total: storageTotal,
          used: storageTotal - storageFree,
          free: storageFree,
          usagePercent: parseFloat(storageUsage.toFixed(2)),
        },
        uptime: os.uptime(),
      };
    } catch (error) {
      this.logger.error('Error getting server metrics:', error);
      return {
        cpu: { usage: 0, load1: 0, load5: 0, load15: 0, cores: 0 },
        memory: { total: 0, used: 0, free: 0, usagePercent: 0 },
        storage: { total: 0, used: 0, free: 0, usagePercent: 0 },
        uptime: 0,
      };
    }
  }

  async getSecuritySummary(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [lastHour, lastDay, total, blockedIPs] = await Promise.all([
        this.securityRepository.count({
          where: { timestamp: MoreThan(oneHourAgo) },
        }),
        this.securityRepository.count({
          where: { timestamp: MoreThan(oneDayAgo) },
        }),
        this.securityRepository.count(),
        this.blockedIpRepository.count({
          where: { is_active: true },
        }),
      ]);

      return {
        events: {
          lastHour,
          lastDay,
          total,
        },
        blockedIPs,
      };
    } catch (error) {
      this.logger.error('Error getting security summary:', error);
      return { events: { lastHour: 0, lastDay: 0, total: 0 }, blockedIPs: 0 };
    }
  }

  // ==================== USER GROWTH ====================

  async getUserGrowth(period: string = 'month'): Promise<any[]> {
    try {
      const now = new Date();
      let startDate: Date;
      const groupBy: string = this.getGroupBy(period);

      switch (period) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const growth = await this.analyticsRepository
        .createQueryBuilder('event')
        .select(`DATE_TRUNC('${groupBy}', timestamp)`, 'date')
        .addSelect('COUNT(DISTINCT user_id)', 'new_users')
        .where('timestamp > :startDate', { startDate })
        .andWhere('event_type = :type', { type: EventType.USER_REGISTER })
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany();

      return growth;
    } catch (error) {
      this.logger.error('Error getting user growth:', error);
      return [];
    }
  }

  private getGroupBy(period: string): string {
    switch (period) {
      case 'day': return 'hour';
      case 'week': return 'day';
      case 'month': return 'day';
      case 'year': return 'month';
      default: return 'day';
    }
  }

  // ==================== GEOGRAPHIC DISTRIBUTION ====================

  async getGeoDistribution(): Promise<any> {
    try {
      const distribution = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('country', 'country')
        .addSelect('COUNT(DISTINCT hashed_user_id)', 'user_count')
        .where('country IS NOT NULL')
        .andWhere('hashed_user_id IS NOT NULL')
        .groupBy('country')
        .orderBy('user_count', 'DESC')
        .getRawMany();

      const total = distribution.reduce((sum, item) => sum + parseInt(item.user_count), 0);

      return {
        total,
        distribution: distribution.map(item => ({
          country: item.country || 'Unknown',
          count: parseInt(item.user_count),
          percentage: total > 0 ? ((parseInt(item.user_count) / total) * 100).toFixed(1) : '0',
        })),
      };
    } catch (error) {
      this.logger.error('Error getting geo distribution:', error);
      return { total: 0, distribution: [] };
    }
  }

  async getGeoMapData(): Promise<any[]> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const locations = await this.analyticsRepository
        .createQueryBuilder('event')
        .select([
          'country',
          'city',
          'latitude',
          'longitude',
          'COUNT(DISTINCT user_id) as user_count',
          'COUNT(*) as event_count',
        ])
        .where('timestamp > :time', { time: last24Hours })
        .andWhere('latitude IS NOT NULL')
        .andWhere('longitude IS NOT NULL')
        .groupBy('country, city, latitude, longitude')
        .orderBy('event_count', 'DESC')
        .limit(100)
        .getRawMany();

      return locations;
    } catch (error) {
      this.logger.error('Error getting geo map data:', error);
      return [];
    }
  }

  async getActiveSessionsByCountry(): Promise<any[]> {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      const sessions = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('country', 'country')
        .addSelect('COUNT(DISTINCT session_id)', 'active_sessions')
        .where('timestamp > :time', { time: fiveMinAgo })
        .andWhere('country IS NOT NULL')
        .andWhere('session_id IS NOT NULL')
        .groupBy('country')
        .orderBy('active_sessions', 'DESC')
        .getRawMany();

      return sessions;
    } catch (error) {
      this.logger.error('Error getting active sessions by country:', error);
      return [];
    }
  }

  // ==================== DEVICE ANALYTICS ====================

  async getDeviceDistribution(): Promise<any> {
    try {
      const distribution = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('platform', 'platform')
        .addSelect('device_model', 'device_model')
        .addSelect('os_version', 'os_version')
        .addSelect('COUNT(DISTINCT hashed_user_id)', 'user_count')
        .addSelect('COUNT(*)', 'event_count')
        .where('hashed_user_id IS NOT NULL')
        .groupBy('platform, device_model, os_version')
        .orderBy('user_count', 'DESC')
        .getRawMany();

      const total = distribution.reduce((sum, item) => sum + parseInt(item.user_count), 0);

      const platforms = {
        [PlatformType.ANDROID]: { name: 'Android', color: '#3DDC84', icon: '📱' },
        [PlatformType.IOS]: { name: 'iOS', color: '#000000', icon: '📱' },
        [PlatformType.WEB]: { name: 'Web', color: '#4285F4', icon: '💻' },
        [PlatformType.ADMIN]: { name: 'Admin', color: '#EA4335', icon: '👨‍💻' },
        [PlatformType.UNKNOWN]: { name: 'Unknown', color: '#9AA0A6', icon: '❓' },
      };

      // Group by platform for main distribution
      const platformMap = new Map();
      distribution.forEach(item => {
        const platform = item.platform;
        if (!platformMap.has(platform)) {
          platformMap.set(platform, {
            platform,
            userCount: 0,
            sessionCount: 0,
            devices: []
          });
        }
        const p = platformMap.get(platform);
        p.userCount += parseInt(item.user_count);
        p.sessionCount += parseInt(item.event_count);
        p.devices.push({
          model: item.device_model,
          os: item.os_version,
          count: parseInt(item.user_count)
        });
      });

      return {
        total,
        distribution: Array.from(platformMap.values()).map(item => {
          const platform = platforms[item.platform] || {
            name: item.platform,
            color: '#9AA0A6',
            icon: '❓'
          };
          return {
            platform: item.platform,
            name: platform.name,
            color: platform.color,
            icon: platform.icon,
            userCount: item.userCount,
            sessionCount: item.sessionCount,
            percentage: total > 0 ? ((item.userCount / total) * 100).toFixed(1) : '0',
            devices: item.devices
          };
        }),
      };
    } catch (error) {
      this.logger.error('Error getting device distribution:', error);
      return { total: 0, distribution: [] };
    }
  }

  async getOSVersions(): Promise<any[]> {
    try {
      const versions = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('os_version', 'version')
        .addSelect('platform', 'platform')
        .addSelect('COUNT(DISTINCT user_id)', 'user_count')
        .where('os_version IS NOT NULL')
        .groupBy('platform, os_version')
        .orderBy('user_count', 'DESC')
        .getRawMany();

      return versions;
    } catch (error) {
      this.logger.error('Error getting OS versions:', error);
      return [];
    }
  }

  async getAppVersions(): Promise<any[]> {
    try {
      const versions = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('app_version', 'version')
        .addSelect('platform', 'platform')
        .addSelect('COUNT(DISTINCT user_id)', 'user_count')
        .where('app_version IS NOT NULL')
        .groupBy('platform, app_version')
        .orderBy('user_count', 'DESC')
        .getRawMany();

      return versions;
    } catch (error) {
      this.logger.error('Error getting app versions:', error);
      return [];
    }
  }

  async getDeviceModels(): Promise<any[]> {
    try {
      const models = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('device_model', 'model')
        .addSelect('platform', 'platform')
        .addSelect('COUNT(DISTINCT user_id)', 'user_count')
        .where('device_model IS NOT NULL')
        .groupBy('platform, device_model')
        .orderBy('user_count', 'DESC')
        .limit(20)
        .getRawMany();

      return models;
    } catch (error) {
      this.logger.error('Error getting device models:', error);
      return [];
    }
  }

  // ==================== PERFORMANCE METRICS ====================

  async getPerformanceMetrics(): Promise<any> {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Get average response time
      const avgResponse = await this.analyticsRepository
        .createQueryBuilder('event')
        .select('AVG(response_time_ms)', 'avg')
        .where('timestamp > :time', { time: fiveMinAgo })
        .andWhere('response_time_ms > 0')
        .getRawOne();

      // Get error rate
      const [totalRequests, errorCount] = await Promise.all([
        this.analyticsRepository.count({
          where: { timestamp: MoreThan(fiveMinAgo) },
        }),
        this.securityRepository.count({
          where: { timestamp: MoreThan(fiveMinAgo) },
        }),
      ]);

      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

      // Get server metrics
      const serverMetrics = await this.getServerMetrics();

      return {
        ...serverMetrics,
        responseTime: parseFloat(avgResponse?.avg) || 0,
        errorRate: parseFloat(errorRate.toFixed(2)),
      };
    } catch (error) {
      this.logger.error('Error getting performance metrics:', error);
      return {
        cpu: { usage: 0, load1: 0, load5: 0, load15: 0, cores: 0 },
        memory: { total: 0, used: 0, free: 0, usagePercent: 0 },
        storage: { total: 0, used: 0, free: 0, usagePercent: 0 },
        responseTime: 0,
        errorRate: 0,
      };
    }
  }

  // ==================== SECURITY ANALYTICS ====================

  async getRecentSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
    try {
      return await this.securityRepository.find({
        order: { timestamp: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error('Error getting recent security events:', error);
      return [];
    }
  }

  async getSecurityStats(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [lastHour, lastDay, total, byType, byCountry] = await Promise.all([
        this.securityRepository.count({
          where: { timestamp: MoreThan(oneHourAgo) },
        }),
        this.securityRepository.count({
          where: { timestamp: MoreThan(oneDayAgo) },
        }),
        this.securityRepository.count(),
        this.securityRepository
          .createQueryBuilder('event')
          .select('event_type', 'type')
          .addSelect('COUNT(*)', 'count')
          .where('timestamp > :time', { time: oneDayAgo })
          .groupBy('event_type')
          .getRawMany(),
        this.securityRepository
          .createQueryBuilder('event')
          .select('country', 'country')
          .addSelect('COUNT(*)', 'count')
          .where('timestamp > :time', { time: oneDayAgo })
          .andWhere('country IS NOT NULL')
          .groupBy('country')
          .orderBy('count', 'DESC')
          .limit(10)
          .getRawMany(),
      ]);

      return {
        lastHour,
        lastDay,
        total,
        byType,
        byCountry,
      };
    } catch (error) {
      this.logger.error('Error getting security stats:', error);
      return { lastHour: 0, lastDay: 0, total: 0, byType: [], byCountry: [] };
    }
  }

  async getBlockedIPs(activeOnly: boolean = true): Promise<BlockedIP[]> {
    try {
      const where: any = {};
      if (activeOnly) {
        where.is_active = true;
      }

      return await this.blockedIpRepository.find({
        where,
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Error getting blocked IPs:', error);
      return [];
    }
  }

  // ==================== EVENT LOGGING ====================

    async logEvent(data: {
    eventType: EventType;
    userId?: string;
    platform?: PlatformType;
    appVersion?: string;
    deviceModel?: string;
    osVersion?: string;
    country?: string;
    city?: string;
    responseTimeMs?: number;
  }): Promise<AnalyticsEvent | null> {
    try {
      // ✅ Hash the user_id - no raw ID stored
      const hashedUserId = data.userId 
        ? AnalyticsEvent.hashUserId(data.userId) 
        : null;

      const event = this.analyticsRepository.create({
        event_type: data.eventType,
        hashed_user_id: hashedUserId,
        platform: data.platform || PlatformType.UNKNOWN,
        app_version: data.appVersion,
        device_model: data.deviceModel,
        os_version: data.osVersion,
        country: data.country,
        city: data.city,
        response_time_ms: data.responseTimeMs || 0,
        timestamp: new Date(),
      });

      return await this.analyticsRepository.save(event);
    } catch (error) {
      this.logger.error('Error logging event:', error);
      return null;
    }
  }

  async logSecurityEvent(data: {
    eventType: SecurityEventType;
    level: SecurityLevel;
    ipAddress: string;
    userId?: string;
    username?: string;
    endpoint?: string;
    method?: string;
    metadata?: any;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    userAgent?: string;
  }): Promise<SecurityEvent | null> {
    try {
      const event = this.securityRepository.create({
        event_type: data.eventType,
        security_level: data.level,
        ip_address: data.ipAddress,
        user_id: data.userId,
        username: data.username,
        endpoint: data.endpoint,
        method: data.method,
        request_data: data.metadata || {},
        country: data.country,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        user_agent: data.userAgent,
        timestamp: new Date(),
        attempt_count: 1,
        is_resolved: false,
      });

      return await this.securityRepository.save(event);
    } catch (error) {
      this.logger.error('Error logging security event:', error);
      return null;
    }
  }

  async blockIP(data: {
    ipAddress: string;
    reason: string;
    description: string;
    expiresAt?: Date;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    blockedBy?: string;
  }): Promise<BlockedIP | null> {
    try {
      let blockedIp = await this.blockedIpRepository.findOne({
        where: { ip_address: data.ipAddress },
      });

      if (blockedIp) {
        blockedIp.is_active = true;
        blockedIp.reason = data.reason as any;
        blockedIp.description = data.description;
        blockedIp.expires_at = data.expiresAt || null;
        blockedIp.attempt_count = (blockedIp.attempt_count || 0) + 1;
        // Use type assertion to bypass TypeScript strict checking
        blockedIp.country = (data.country || null) as any;
        blockedIp.city = (data.city || null) as any;
        blockedIp.latitude = (data.latitude || null) as any;
        blockedIp.longitude = (data.longitude || null) as any;
        blockedIp.blocked_by = (data.blockedBy || null) as any;

        return await this.blockedIpRepository.save(blockedIp);
      } else {
        const newBlockedIp = new BlockedIP();
        newBlockedIp.ip_address = data.ipAddress;
        newBlockedIp.reason = data.reason as any;
        newBlockedIp.description = data.description;
        newBlockedIp.expires_at = data.expiresAt || null;
        // Use type assertion to bypass TypeScript strict checking
        newBlockedIp.country = (data.country || null) as any;
        newBlockedIp.city = (data.city || null) as any;
        newBlockedIp.latitude = (data.latitude || null) as any;
        newBlockedIp.longitude = (data.longitude || null) as any;
        newBlockedIp.blocked_by = (data.blockedBy || null) as any;
        newBlockedIp.is_active = true;
        newBlockedIp.attempt_count = 1;
        newBlockedIp.action = BlockAction.AUTO_BLOCK;

        return await this.blockedIpRepository.save(newBlockedIp);
      }
    } catch (error) {
      this.logger.error('Error blocking IP:', error);
      return null;
    }
  }

  async unblockIP(id: string, unblockedBy: string, reason: string): Promise<BlockedIP | null> {
    try {
      const blockedIp = await this.blockedIpRepository.findOne({ where: { id } });
      if (!blockedIp) {
        throw new Error('Blocked IP not found');
      }

      blockedIp.is_active = false;
      blockedIp.unblocked_at = new Date();
      blockedIp.unblocked_by = unblockedBy;
      blockedIp.unblock_reason = reason;

      return await this.blockedIpRepository.save(blockedIp);
    } catch (error) {
      this.logger.error('Error unblocking IP:', error);
      return null;
    }
  }

  // ==================== CLEANUP OLD DATA ====================

  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Delete old analytics events
      await this.analyticsRepository.delete({
        timestamp: LessThan(cutoffDate),
      });

      // Delete old security events (keep longer for security)
      const securityCutoff = new Date();
      securityCutoff.setDate(securityCutoff.getDate() - 90); // Keep 90 days
      await this.securityRepository.delete({
        timestamp: LessThan(securityCutoff),
      });

      // Delete old metrics
      await this.metricsRepository.delete({
        timestamp: LessThan(cutoffDate),
      });

      this.logger.log(`Cleaned up data older than ${daysToKeep} days`);
    } catch (error) {
      this.logger.error('Error cleaning up old data:', error);
    }
  }
}