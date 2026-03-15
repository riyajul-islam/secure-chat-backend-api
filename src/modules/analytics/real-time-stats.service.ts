import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, MoreThan } from 'typeorm';
import { ServerMetrics } from './entities/server-metrics.entity';
import { AnalyticsEvent, EventType } from './entities/analytics.entity';
import { SecurityEvent } from './entities/security-event.entity';
import * as os from 'os';
import * as disk from 'diskusage';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    namespace: 'analytics',
    cors: {
        origin: ['https://proappadmin.scratchwizard.net', 'http://localhost:3000'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
})
@Injectable()
export class RealTimeStatsService implements OnModuleInit {
    @WebSocketServer()
    server: Server;

    private metricsInterval: NodeJS.Timeout;
    private currentStats: any = {};

    constructor(
        @InjectRepository(ServerMetrics)
        private metricsRepository: Repository<ServerMetrics>,
        @InjectRepository(AnalyticsEvent)
        private analyticsRepository: Repository<AnalyticsEvent>,
        @InjectRepository(SecurityEvent)
        private securityRepository: Repository<SecurityEvent>,
    ) { }

    onModuleInit() {
        // Clean old metrics on startup (keep only latest)
        this.cleanOldMetrics();

        // Schedule daily cleanup at midnight
        this.scheduleDailyCleanup();

        // Collect metrics every 10 seconds
        this.metricsInterval = setInterval(() => {
            this.collectServerMetrics();
        }, 3600000); // ✅ Fixed: Changed from 3600000 (1 hour) to 10000 (10 seconds)
    }

    // Manual refresh for button click
    async refreshMetricsManually(): Promise<any> {
        console.log('🔄 Manual refresh triggered at:', new Date().toISOString());
        return await this.collectServerMetrics();
    }

    // Clean old metrics (keep only latest)
    async cleanOldMetrics() {
        try {
            const allMetrics = await this.metricsRepository.find({
                order: { timestamp: 'DESC' }
            });

            if (allMetrics.length > 1) {
                const [latest, ...oldMetrics] = allMetrics;

                for (const metric of oldMetrics) {
                    await this.metricsRepository.remove(metric);
                }

                console.log(`🧹 Cleaned up ${oldMetrics.length} old metrics, kept latest from ${latest.timestamp}`);
            }
        } catch (error) {
            console.error('Error cleaning old metrics:', error);
        }
    }

    async collectServerMetrics(): Promise<any> {
        try {
            console.log('📊 Collecting server metrics at:', new Date().toISOString());

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
            const cpuUsage = 100 - (totalIdle / totalTick) * 100;

            // Memory Info
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memUsage = (usedMem / totalMem) * 100;

            // Storage Info (assuming root path)
            const diskInfo = await disk.check('/');
            const storageTotal = diskInfo.total;
            const storageFree = diskInfo.free;
            const storageUsed = storageTotal - storageFree;
            const storageUsage = (storageUsed / storageTotal) * 100;

            // ✅ FIXED: Use hashed_user_id instead of user_id
            const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
            const activeUsers = await this.analyticsRepository
                .createQueryBuilder('event')
                .select('COUNT(DISTINCT hashed_user_id)', 'count')
                .where('timestamp > :time', { time: fiveMinAgo })
                .andWhere('hashed_user_id IS NOT NULL')
                .getRawOne();

            // Get active calls
            const activeCalls = await this.analyticsRepository
                .createQueryBuilder('event')
                .where('event_type IN (:...types)', {
                    types: [EventType.AUDIO_CALL_START, EventType.VIDEO_CALL_START, EventType.GROUP_CALL_START]
                })
                .andWhere('timestamp > :time', { time: fiveMinAgo })
                .getCount();

            // Get error count
            const errorCount = await this.securityRepository
                .createQueryBuilder('event')
                .where('timestamp > :time', { time: fiveMinAgo })
                .andWhere('security_level IN (:...levels)', {
                    levels: ['high', 'critical']
                })
                .getCount();

            const metrics = {
                timestamp: new Date(),
                cpu_usage_percent: cpuUsage,
                cpu_load_1min: loadAvg[0],
                cpu_load_5min: loadAvg[1],
                cpu_load_15min: loadAvg[2],
                cpu_cores: cpus.length,
                memory_total: totalMem,
                memory_used: usedMem,
                memory_free: freeMem,
                memory_usage_percent: memUsage,
                storage_total: storageTotal,
                storage_used: storageUsed,
                storage_free: storageFree,
                storage_usage_percent: storageUsage,
                network_in_bytes: 0,
                network_out_bytes: 0,
                active_connections: await this.getActiveConnections(),
                database_connections: await this.getDBConnections(),
                total_users: await this.getTotalUsers(),
                active_users_1min: await this.getActiveUsers(1),
                active_users_5min: parseInt(activeUsers?.count) || 0,
                active_users_15min: await this.getActiveUsers(15),
                active_calls: activeCalls,
                active_audio_calls: await this.getActiveCalls(EventType.AUDIO_CALL_START),
                active_video_calls: await this.getActiveCalls(EventType.VIDEO_CALL_START),
                active_group_calls: await this.getActiveCalls(EventType.GROUP_CALL_START),
                messages_per_second: await this.getMessagesPerSecond(),
                average_response_time_ms: await this.getAverageResponseTime(),
                api_requests_per_second: await this.getApiRequestsPerSecond(),
                websocket_connections: await this.getWebSocketConnections(),
                error_count_1min: await this.getErrorCount(1),
                error_count_5min: errorCount,
                error_count_15min: await this.getErrorCount(15),
                error_rate_percent: await this.getErrorRate(),
            };

            // Delete all previous metrics and save only the latest
            await this.metricsRepository.clear();
            const savedMetrics = await this.metricsRepository.save(metrics);

            // Emit via WebSocket
            if (this.server) {
                this.server.emit('metrics-update', savedMetrics);
            }

            this.currentStats = savedMetrics;
            console.log('✅ Metrics saved at:', new Date().toISOString());

            return savedMetrics;
        } catch (error) {
            console.error('Error collecting metrics:', error);
            return null;
        }
    }

    // Daily cleanup job (রাত ১২টায় run হবে)
    async scheduleDailyCleanup() {
        const now = new Date();
        const night = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0
        );
        const msUntilMidnight = night.getTime() - now.getTime();

        setTimeout(() => {
            this.cleanOldMetrics();
            this.scheduleDailyCleanup();
        }, msUntilMidnight);
    }

    // ==================== HISTORY METHODS ====================

    async getHistoryStats(timeRange: { start: Date; end: Date }): Promise<any> {
        try {
            const { start, end } = timeRange;

            const [
                totalMessages,
                audioCalls,
                videoCalls,
                groupCalls,
                fileUploads,
                fileDownloads,
                paymentSuccess,
                paymentFailed,
                subscriptionPurchased,
                subscriptionExpired,
                activeUsers,
                dailyBreakdown
            ] = await Promise.all([
                // Messages
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.MESSAGE_SENT,
                        timestamp: Between(start, end)
                    }
                }),
                // Audio calls
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.AUDIO_CALL_START,
                        timestamp: Between(start, end)
                    }
                }),
                // Video calls
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.VIDEO_CALL_START,
                        timestamp: Between(start, end)
                    }
                }),
                // Group calls
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.GROUP_CALL_START,
                        timestamp: Between(start, end)
                    }
                }),
                // ✅ NEW: File uploads
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.FILE_UPLOAD,
                        timestamp: Between(start, end)
                    }
                }),
                // ✅ NEW: File downloads
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.FILE_DOWNLOAD,
                        timestamp: Between(start, end)
                    }
                }),
                // ✅ NEW: Payment success
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.PAYMENT_SUCCESS,
                        timestamp: Between(start, end)
                    }
                }),
                // ✅ NEW: Payment failed
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.PAYMENT_FAILED,
                        timestamp: Between(start, end)
                    }
                }),
                // ✅ NEW: Subscription purchased
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.SUBSCRIPTION_PURCHASED,
                        timestamp: Between(start, end)
                    }
                }),
                // ✅ NEW: Subscription expired
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.SUBSCRIPTION_EXPIRED,
                        timestamp: Between(start, end)
                    }
                }),
                // ✅ FIXED: Unique active users with hashed_user_id
                this.analyticsRepository
                    .createQueryBuilder('event')
                    .select('COUNT(DISTINCT hashed_user_id)', 'count')
                    .where('timestamp BETWEEN :start AND :end', { start, end })
                    .andWhere('hashed_user_id IS NOT NULL')
                    .getRawOne(),
                // Daily breakdown
                this.getDailyBreakdown(start, end)
            ]);

            return {
                summary: {
                    totalMessages,
                    audioCalls,
                    videoCalls,
                    groupCalls,
                    totalCalls: audioCalls + videoCalls + groupCalls,
                    fileUploads,
                    fileDownloads,
                    activeUsers: parseInt(activeUsers?.count) || 0
                },
                financial: {
                    paymentSuccess,
                    paymentFailed,
                    subscriptionPurchased,
                    subscriptionExpired
                },
                dailyBreakdown,
                timeRange: {
                    start,
                    end
                }
            };
        } catch (error) {
            console.error('Error getting history stats:', error);
            return null;
        }
    }

    async getDailyBreakdown(start: Date, end: Date): Promise<any[]> {
        const days: any[] = [];
        const currentDate = new Date(start);

        while (currentDate <= end) {
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);

            const [
                messages,
                audio,
                video,
                group,
                fileUploads,
                fileDownloads,
                payments,
                users
            ] = await Promise.all([
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.MESSAGE_SENT,
                        timestamp: Between(dayStart, dayEnd)
                    }
                }),
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.AUDIO_CALL_START,
                        timestamp: Between(dayStart, dayEnd)
                    }
                }),
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.VIDEO_CALL_START,
                        timestamp: Between(dayStart, dayEnd)
                    }
                }),
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.GROUP_CALL_START,
                        timestamp: Between(dayStart, dayEnd)
                    }
                }),
                // ✅ NEW: File uploads per day
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.FILE_UPLOAD,
                        timestamp: Between(dayStart, dayEnd)
                    }
                }),
                // ✅ NEW: File downloads per day
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.FILE_DOWNLOAD,
                        timestamp: Between(dayStart, dayEnd)
                    }
                }),
                // ✅ NEW: All payments per day (success + failed)
                this.analyticsRepository.count({
                    where: {
                        event_type: EventType.PAYMENT_SUCCESS,
                        timestamp: Between(dayStart, dayEnd)
                    }
                }),
                // ✅ FIXED: Active users with hashed_user_id
                this.analyticsRepository
                    .createQueryBuilder('event')
                    .select('COUNT(DISTINCT hashed_user_id)', 'count')
                    .where('timestamp BETWEEN :start AND :end', { start: dayStart, end: dayEnd })
                    .andWhere('hashed_user_id IS NOT NULL')
                    .getRawOne()
            ]);

            days.push({
                date: currentDate.toISOString().split('T')[0],
                messages,
                audioCalls: audio,
                videoCalls: video,
                groupCalls: group,
                totalCalls: audio + video + group,
                fileUploads,
                fileDownloads,
                payments,
                activeUsers: parseInt(users?.count) || 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    }

    // Helper function to get date range from string
    getDateRangeFromString(range: string): { start: Date; end: Date } {
        const end = new Date();
        const start = new Date();

        switch (range) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'last7days':
                start.setDate(start.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last15days':
                start.setDate(start.getDate() - 15);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last30days':
                start.setDate(start.getDate() - 30);
                start.setHours(0, 0, 0, 0);
                break;
            case 'last90days':
                start.setDate(start.getDate() - 90);
                start.setHours(0, 0, 0, 0);
                break;
            default:
                start.setDate(start.getDate() - 7);
                start.setHours(0, 0, 0, 0);
        }

        return { start, end };
    }

    // Auto cleanup old data (keep last 7 days)
    async cleanupOldData() {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const deleted = await this.analyticsRepository.delete({
                timestamp: LessThan(sevenDaysAgo)
            });

            console.log(`🧹 Cleaned up ${deleted.affected || 0} old analytics events`);
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }

    // ==================== HELPER METHODS ====================

    private async getActiveUsers(minutes: number): Promise<number> {
        const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
        const result = await this.analyticsRepository
            .createQueryBuilder('event')
            .select('COUNT(DISTINCT hashed_user_id)', 'count')
            .where('timestamp > :time', { time: timeAgo })
            .andWhere('hashed_user_id IS NOT NULL')
            .getRawOne();
        return parseInt(result?.count) || 0;
    }

    private async getActiveCalls(type: EventType): Promise<number> {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        return await this.analyticsRepository
            .createQueryBuilder('event')
            .where('event_type = :type', { type })
            .andWhere('timestamp > :time', { time: fiveMinAgo })
            .getCount();
    }

    private async getMessagesPerSecond(): Promise<number> {
        const oneMinAgo = new Date(Date.now() - 60 * 1000);
        const count = await this.analyticsRepository
            .createQueryBuilder('event')
            .where('event_type = :type', { type: EventType.MESSAGE_SENT })
            .andWhere('timestamp > :time', { time: oneMinAgo })
            .getCount();
        return Math.round(count / 60);
    }

    private async getAverageResponseTime(): Promise<number> {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const result = await this.analyticsRepository
            .createQueryBuilder('event')
            .select('AVG(response_time_ms)', 'avg')
            .where('timestamp > :time', { time: fiveMinAgo })
            .andWhere('response_time_ms > 0')
            .getRawOne();
        return parseFloat(result?.avg) || 0;
    }

    private async getApiRequestsPerSecond(): Promise<number> {
        const oneMinAgo = new Date(Date.now() - 60 * 1000);
        const count = await this.analyticsRepository
            .createQueryBuilder('event')
            .where('timestamp > :time', { time: oneMinAgo })
            .getCount();
        return Math.round(count / 60);
    }

    private async getErrorCount(minutes: number): Promise<number> {
        const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
        return await this.securityRepository
            .createQueryBuilder('event')
            .where('timestamp > :time', { time: timeAgo })
            .andWhere('security_level IN (:...levels)', {
                levels: ['high', 'critical']
            })
            .getCount();
    }

    private async getErrorRate(): Promise<number> {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const [totalRequests, errors] = await Promise.all([
            this.analyticsRepository.count({
                where: { timestamp: MoreThan(fiveMinAgo) }
            }),
            this.securityRepository.count({
                where: { timestamp: MoreThan(fiveMinAgo) }
            })
        ]);
        return totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    }

    private async getActiveConnections(): Promise<number> {
        return 0;
    }

    private async getDBConnections(): Promise<number> {
        return 0;
    }

    private async getTotalUsers(): Promise<number> {
        return 0;
    }

    private async getWebSocketConnections(): Promise<number> {
        return 0;
    }

    getCurrentStats() {
        return this.currentStats;
    }

    onModuleDestroy() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
    }
}