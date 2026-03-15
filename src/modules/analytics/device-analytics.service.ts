import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent, PlatformType } from './entities/analytics.entity';

@Injectable()
export class DeviceAnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
  ) {}

  async getDeviceDistribution(): Promise<any> {
    const distribution = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('platform', 'platform')
      .addSelect('device_model', 'device_model')
      .addSelect('os_version', 'os_version')
      .addSelect('COUNT(DISTINCT hashed_user_id)', 'user_count')  // ✅ FIX: user_id -> hashed_user_id
      .addSelect('COUNT(*)', 'event_count')
      .where('hashed_user_id IS NOT NULL')  // ✅ FIX: user_id -> hashed_user_id
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
  }

  async getOSVersions(): Promise<any> {
    const versions = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('os_version', 'version')
      .addSelect('platform', 'platform')
      .addSelect('COUNT(DISTINCT hashed_user_id)', 'user_count')  // ✅ FIX
      .where('os_version IS NOT NULL')
      .andWhere('hashed_user_id IS NOT NULL')  // ✅ FIX
      .groupBy('platform, os_version')
      .orderBy('user_count', 'DESC')
      .getRawMany();

    return versions;
  }

  async getAppVersions(): Promise<any> {
    const versions = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('app_version', 'version')
      .addSelect('platform', 'platform')
      .addSelect('COUNT(DISTINCT hashed_user_id)', 'user_count')  // ✅ FIX
      .where('app_version IS NOT NULL')
      .andWhere('hashed_user_id IS NOT NULL')  // ✅ FIX
      .groupBy('platform, app_version')
      .orderBy('user_count', 'DESC')
      .getRawMany();

    return versions;
  }

  async getDeviceModels(): Promise<any> {
    const models = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('device_model', 'model')
      .addSelect('platform', 'platform')
      .addSelect('COUNT(DISTINCT hashed_user_id)', 'user_count')  // ✅ FIX
      .where('device_model IS NOT NULL')
      .andWhere('hashed_user_id IS NOT NULL')  // ✅ FIX
      .groupBy('platform, device_model')
      .orderBy('user_count', 'DESC')
      .limit(20)
      .getRawMany();

    return models;
  }
}