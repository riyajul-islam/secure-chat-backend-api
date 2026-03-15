import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { RealTimeStatsService } from './real-time-stats.service';
import { SecurityMonitoringService } from './security-monitoring.service';
import { GeoLocationService } from './geo-location.service';
import { DeviceAnalyticsService } from './device-analytics.service';

// Import all entities
import { AnalyticsEvent } from './entities/analytics.entity';
import { SecurityEvent } from './entities/security-event.entity';
import { ServerMetrics } from './entities/server-metrics.entity';
import { BlockedIP } from './entities/blocked-ip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      SecurityEvent,
      ServerMetrics,
      BlockedIP
    ])
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    RealTimeStatsService,
    SecurityMonitoringService,
    GeoLocationService,
    DeviceAnalyticsService
  ],
  exports: [
    AnalyticsService,
    RealTimeStatsService,
    SecurityMonitoringService,
    GeoLocationService,
    DeviceAnalyticsService,
    TypeOrmModule
  ]
})
export class AnalyticsModule { }