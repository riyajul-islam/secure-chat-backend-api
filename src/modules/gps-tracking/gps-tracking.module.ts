import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';  // ← এই line টি যোগ করুন
import { ConfigService } from '@nestjs/config';  // ← এই line টি যোগ করুন
import { GpsTrackingService } from './gps-tracking.service';
import { GpsTrackingController } from './gps-tracking.controller';
import { GpsTrackingGateway } from './gateways/gps-tracking.gateway';
import { TrackingGroup } from './entities/tracking-group.entity';
import { GroupParticipant } from './entities/group-participant.entity';
import { LocationHistory } from './entities/location-history.entity';
import { User } from '../users/entities/user.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';  // ← এই line টি যোগ করুন

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingGroup, GroupParticipant, LocationHistory, User]),
    SubscriptionsModule,
    JwtModule.registerAsync({  // ← এই block টি যোগ করুন
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  controllers: [GpsTrackingController],
  providers: [
    GpsTrackingService, 
    GpsTrackingGateway,
    WsJwtGuard,  // ← এই line টি যোগ করুন
  ],
  exports: [GpsTrackingService],
})
export class GpsTrackingModule {}