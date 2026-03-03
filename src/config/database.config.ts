import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Admin } from '../modules/admins/entities/admin.entity';
import { Banner } from '../modules/banners/entities/banner.entity';
import { NewsArticle } from '../modules/news/entities/news-article.entity';
import { Page } from '../modules/pages/entities/page.entity';
import { PaymentMethod } from '../modules/payments/entities/payment-method.entity';
import { FundRequest } from '../modules/payments/entities/fund-request.entity';
import { Transaction } from '../modules/payments/entities/transaction.entity';
import { SubscriptionPlan } from '../modules/subscriptions/entities/subscription-plan.entity';
import { SubscriptionRequest } from '../modules/subscriptions/entities/subscription-request.entity';
import { UserSubscription } from '../modules/subscriptions/entities/user-subscription.entity';
import { Announcement } from '../modules/announcements/entities/announcement.entity';
import { Popup } from '../modules/popups/entities/popup.entity';
import { DeviceToken } from '../modules/notifications/entities/device-token.entity';
import { NotificationHistory } from '../modules/notifications/entities/notification-history.entity';
import { MessageQueue } from '../modules/chat/entities/message-queue.entity';
import { UserPresence } from '../modules/chat/entities/user-presence.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { Session } from '../modules/chat/entities/session.entity';
import { Conversation } from '../modules/chat/entities/conversation.entity';
import { ConversationParticipant } from '../modules/chat/entities/conversation-participant.entity';
import { Message } from '../modules/chat/entities/message.entity';
import { TrackingGroup } from '../modules/gps-tracking/entities/tracking-group.entity';
import { GroupParticipant } from '../modules/gps-tracking/entities/group-participant.entity';
import { LocationHistory } from '../modules/gps-tracking/entities/location-history.entity';
import { Report } from '../modules/reports/entities/report.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { VerificationPlan } from '../modules/verification/entities/verification-plan.entity';
import { VerificationRequest } from '../modules/verification/entities/verification-request.entity';



export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [
    User,
    Admin,
    Banner,
    NewsArticle,
    Page,
    PaymentMethod,
    FundRequest,
    Transaction,  // ← এই entity টি এখন সঠিক পাথ থেকে ইম্পোর্ট হচ্ছে
    SubscriptionPlan,
    UserSubscription,
    SubscriptionRequest,
    Report,
    Announcement,
    Popup,
    VerificationPlan,
    VerificationRequest,
    DeviceToken,
    NotificationHistory,
    MessageQueue,
    UserPresence,
    AuditLog,
    Session,
    Conversation,
    ConversationParticipant,
    Message,
    TrackingGroup,
    GroupParticipant,
    LocationHistory,
    Report,
    Notification,
  ],
  synchronize: configService.get('DB_SYNC') === 'true',
  logging: configService.get('DB_LOGGING') === 'true',
  ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
  extra: {
    max: configService.get('DB_MAX_CONNECTIONS') ? parseInt(configService.get('DB_MAX_CONNECTIONS') as string) : 100,
  },
});