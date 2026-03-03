import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminsModule } from './modules/admins/admins.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RootController } from './modules/root.controller';
import { PagesModule } from './modules/pages/pages.module';
import { BannersModule } from './modules/banners/banners.module';
import { NewsModule } from './modules/news/news.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { GpsTrackingModule } from './modules/gps-tracking/gps-tracking.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { PopupsModule } from './modules/popups/popups.module';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [
    // Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    
    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get('THROTTLE_TTL') ? parseInt(config.get('THROTTLE_TTL') as string) : 60,
        limit: config.get('THROTTLE_LIMIT') ? parseInt(config.get('THROTTLE_LIMIT') as string) : 100,
      }]),
    }),
    
    // Static Files (for uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    
    // Feature Modules
    AuthModule,
    UsersModule,
    AdminsModule,
    HealthModule,
    NotificationsModule,
    PagesModule,
    BannersModule,
    NewsModule,
    PaymentsModule,
    SubscriptionsModule,
    GpsTrackingModule,
    ReportsModule,
    AnnouncementsModule,
    PopupsModule,
    VerificationModule,
  ],
  controllers: [RootController],
  providers: [],
})
export class AppModule {}