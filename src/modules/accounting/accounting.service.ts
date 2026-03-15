import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SubscriptionRequest } from '../subscriptions/entities/subscription-request.entity';
import { VerificationRequest, VerificationRequestStatus } from '../verification/entities/verification-request.entity';
import { SubscriptionRequestStatus } from '../subscriptions/enums/subscription.enum';

export enum TimeRange {
    TODAY = 'today',
    LAST_7_DAYS = 'last_7_days',
    LAST_15_DAYS = 'last_15_days',
    LAST_30_DAYS = 'last_30_days',
    LAST_6_MONTHS = 'last_6_months',
    LAST_12_MONTHS = 'last_12_months',
    CUSTOM = 'custom'
}

export interface CurrencyAmount {
    usd: number;
    bdt: number;
    count: number;
}

export interface CategoryTotals {
    approved: CurrencyAmount;
    pending: CurrencyAmount;
    rejected: CurrencyAmount;
    total: CurrencyAmount;
}

export interface AccountingOverview {
    subscription: CategoryTotals;
    verification: CategoryTotals;
    overall: CategoryTotals;
}

export interface DailyRevenueItem {
    date: string;
    subscription: {
        usd: number;
        bdt: number;
    };
    verification: {
        usd: number;
        bdt: number;
    };
    total: {
        usd: number;
        bdt: number;
    };
}

export interface TopUser {
    user_id: string;
    user_name: string;
    user_email: string;
    user_code: string;
    total_usd: number;
    total_bdt: number;
    transaction_count: number;
}

export interface PlanBreakdownItem {
  plan_id: string;
  plan_name: string;
  plan_credits: number;
  plan_usd_price: number;
  plan_bdt_price: number;
  total_count: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  total_usd: number;
  total_bdt: number;
  approved_usd: number;
  approved_bdt: number;
  // ✅ NEW fields
  approved_usd_count: number;
  approved_bdt_count: number;
}

export interface PlanBreakdown {
    subscription: PlanBreakdownItem[];
    verification: PlanBreakdownItem[];
}

export interface SummaryReport {
    overview: AccountingOverview;
    planBreakdown: PlanBreakdown;
    topUsers: TopUser[];
    dailyRevenue: DailyRevenueItem[];
    generatedAt: Date;
    range: {
        type: TimeRange;
        start: Date;
        end: Date;
    };
}

@Injectable()
export class AccountingService {
    constructor(
        @InjectRepository(SubscriptionRequest)
        private subscriptionRepo: Repository<SubscriptionRequest>,
        @InjectRepository(VerificationRequest)
        private verificationRepo: Repository<VerificationRequest>,
    ) { }

    private getDateRange(range: TimeRange, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (range) {
            case TimeRange.TODAY:
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case TimeRange.LAST_7_DAYS:
                start.setDate(now.getDate() - 7);
                break;
            case TimeRange.LAST_15_DAYS:
                start.setDate(now.getDate() - 15);
                break;
            case TimeRange.LAST_30_DAYS:
                start.setDate(now.getDate() - 30);
                break;
            case TimeRange.LAST_6_MONTHS:
                start.setMonth(now.getMonth() - 6);
                break;
            case TimeRange.LAST_12_MONTHS:
                start.setFullYear(now.getFullYear() - 1);
                break;
            case TimeRange.CUSTOM:
                if (customStart && customEnd) {
                    return { start: customStart, end: customEnd };
                }
                break;
        }

        return { start, end };
    }

    async getAccountingOverview(
        range: TimeRange,
        customStart?: Date,
        customEnd?: Date,
    ): Promise<AccountingOverview> {
        const { start, end } = this.getDateRange(range, customStart, customEnd);

        // Get all subscription requests in date range
        const subscriptions = await this.subscriptionRepo.find({
            where: {
                created_at: Between(start, end),
            },
            relations: ['plan', 'user'],
        });

        // Get all verification requests in date range
        const verifications = await this.verificationRepo.find({
            where: {
                created_at: Between(start, end),
            },
            relations: ['plan', 'user'],
        });

        // Calculate totals
        const totals: AccountingOverview = {
            subscription: {
                approved: { usd: 0, bdt: 0, count: 0 },
                pending: { usd: 0, bdt: 0, count: 0 },
                rejected: { usd: 0, bdt: 0, count: 0 },
                total: { usd: 0, bdt: 0, count: 0 },
            },
            verification: {
                approved: { usd: 0, bdt: 0, count: 0 },
                pending: { usd: 0, bdt: 0, count: 0 },
                rejected: { usd: 0, bdt: 0, count: 0 },
                total: { usd: 0, bdt: 0, count: 0 },
            },
            overall: {
                approved: { usd: 0, bdt: 0, count: 0 },
                pending: { usd: 0, bdt: 0, count: 0 },
                rejected: { usd: 0, bdt: 0, count: 0 },
                total: { usd: 0, bdt: 0, count: 0 },
            },
        };

        // Process subscriptions
        subscriptions.forEach(sub => {
            // ✅ FIX: Check for 'USD' or 'usd' or 'Usd' etc.
            const currency = (sub.payment_currency || 'USD').toUpperCase();
            const amount = Number(sub.amount);

            totals.subscription.total.count++;

            if (currency === 'USD') {
                totals.subscription.total.usd += amount;
            } else if (currency === 'BDT') {
                totals.subscription.total.bdt += amount;
            }

            if (sub.status === SubscriptionRequestStatus.APPROVED) {
                if (currency === 'USD') {
                    totals.subscription.approved.usd += amount;
                } else if (currency === 'BDT') {
                    totals.subscription.approved.bdt += amount;
                }
                totals.subscription.approved.count++;
            } else if (sub.status === SubscriptionRequestStatus.PENDING) {
                if (currency === 'USD') {
                    totals.subscription.pending.usd += amount;
                } else if (currency === 'BDT') {
                    totals.subscription.pending.bdt += amount;
                }
                totals.subscription.pending.count++;
            } else if (sub.status === SubscriptionRequestStatus.DECLINED) {
                if (currency === 'USD') {
                    totals.subscription.rejected.usd += amount;
                } else if (currency === 'BDT') {
                    totals.subscription.rejected.bdt += amount;
                }
                totals.subscription.rejected.count++;
            }
        });

        // Process verifications
        verifications.forEach(ver => {
            // ✅ FIX: Check for 'USD' or 'usd' or 'Usd' etc.
            const currency = (ver.currency || 'USD').toUpperCase();
            const amount = Number(ver.amount);

            totals.verification.total.count++;

            if (currency === 'USD') {
                totals.verification.total.usd += amount;
            } else if (currency === 'BDT') {
                totals.verification.total.bdt += amount;
            }

            if (ver.status === VerificationRequestStatus.APPROVED) {
                if (currency === 'USD') {
                    totals.verification.approved.usd += amount;
                } else if (currency === 'BDT') {
                    totals.verification.approved.bdt += amount;
                }
                totals.verification.approved.count++;
            } else if (
                ver.status === VerificationRequestStatus.PENDING ||
                ver.status === VerificationRequestStatus.AWAITING_EMAIL_VERIFICATION
            ) {
                if (currency === 'USD') {
                    totals.verification.pending.usd += amount;
                } else if (currency === 'BDT') {
                    totals.verification.pending.bdt += amount;
                }
                totals.verification.pending.count++;
            } else if (ver.status === VerificationRequestStatus.REJECTED) {
                if (currency === 'USD') {
                    totals.verification.rejected.usd += amount;
                } else if (currency === 'BDT') {
                    totals.verification.rejected.bdt += amount;
                }
                totals.verification.rejected.count++;
            }
        });

        // Calculate overall totals
        totals.overall.total.usd = totals.subscription.total.usd + totals.verification.total.usd;
        totals.overall.total.bdt = totals.subscription.total.bdt + totals.verification.total.bdt;
        totals.overall.total.count = totals.subscription.total.count + totals.verification.total.count;

        totals.overall.approved.usd = totals.subscription.approved.usd + totals.verification.approved.usd;
        totals.overall.approved.bdt = totals.subscription.approved.bdt + totals.verification.approved.bdt;
        totals.overall.approved.count = totals.subscription.approved.count + totals.verification.approved.count;

        totals.overall.pending.usd = totals.subscription.pending.usd + totals.verification.pending.usd;
        totals.overall.pending.bdt = totals.subscription.pending.bdt + totals.verification.pending.bdt;
        totals.overall.pending.count = totals.subscription.pending.count + totals.verification.pending.count;

        totals.overall.rejected.usd = totals.subscription.rejected.usd + totals.verification.rejected.usd;
        totals.overall.rejected.bdt = totals.subscription.rejected.bdt + totals.verification.rejected.bdt;
        totals.overall.rejected.count = totals.subscription.rejected.count + totals.verification.rejected.count;

        return totals;
    }

    async getPlanWiseBreakdown(
        range: TimeRange,
        customStart?: Date,
        customEnd?: Date,
        ): Promise<PlanBreakdown> {
        const { start, end } = this.getDateRange(range, customStart, customEnd);

        // Subscription plans breakdown
        const subscriptionPlans = await this.subscriptionRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.plan', 'plan')
            .where('request.created_at BETWEEN :start AND :end', { start, end })
            .select([
            'plan.id as plan_id',
            'plan.name as plan_name',
            'plan.credits as plan_credits',
            'plan.usd_price as plan_usd_price',
            'plan.bdt_price as plan_bdt_price',
            'COUNT(*) as total_count',
            'SUM(CASE WHEN request.status = :approved THEN 1 ELSE 0 END) as approved_count',
            'SUM(CASE WHEN request.status = :pending THEN 1 ELSE 0 END) as pending_count',
            'SUM(CASE WHEN request.status = :declined THEN 1 ELSE 0 END) as rejected_count',
            // Total amounts
            'SUM(CASE WHEN UPPER(request.payment_currency) = \'USD\' THEN request.amount ELSE 0 END) as total_usd',
            'SUM(CASE WHEN UPPER(request.payment_currency) = \'BDT\' THEN request.amount ELSE 0 END) as total_bdt',
            // Approved amounts with currency-specific counts
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.payment_currency) = \'USD\' THEN request.amount ELSE 0 END) as approved_usd',
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.payment_currency) = \'BDT\' THEN request.amount ELSE 0 END) as approved_bdt',
            // ✅ NEW: Currency-specific approved counts
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.payment_currency) = \'USD\' THEN 1 ELSE 0 END) as approved_usd_count',
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.payment_currency) = \'BDT\' THEN 1 ELSE 0 END) as approved_bdt_count',
            ])
            .setParameter('approved', SubscriptionRequestStatus.APPROVED)
            .setParameter('pending', SubscriptionRequestStatus.PENDING)
            .setParameter('declined', SubscriptionRequestStatus.DECLINED)
            .groupBy('plan.id')
            .getRawMany();

        // Verification plans breakdown
        const verificationPlans = await this.verificationRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.plan', 'plan')
            .where('request.created_at BETWEEN :start AND :end', { start, end })
            .select([
            'plan.id as plan_id',
            'plan.name as plan_name',
            'plan.credits as plan_credits',
            'plan.usd_price as plan_usd_price',
            'plan.bdt_price as plan_bdt_price',
            'COUNT(*) as total_count',
            'SUM(CASE WHEN request.status = :approved THEN 1 ELSE 0 END) as approved_count',
            'SUM(CASE WHEN request.status IN (:...pending) THEN 1 ELSE 0 END) as pending_count',
            'SUM(CASE WHEN request.status = :rejected THEN 1 ELSE 0 END) as rejected_count',
            // Total amounts
            'SUM(CASE WHEN UPPER(request.currency) = \'USD\' THEN request.amount ELSE 0 END) as total_usd',
            'SUM(CASE WHEN UPPER(request.currency) = \'BDT\' THEN request.amount ELSE 0 END) as total_bdt',
            // Approved amounts with currency-specific counts
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.currency) = \'USD\' THEN request.amount ELSE 0 END) as approved_usd',
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.currency) = \'BDT\' THEN request.amount ELSE 0 END) as approved_bdt',
            // ✅ NEW: Currency-specific approved counts
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.currency) = \'USD\' THEN 1 ELSE 0 END) as approved_usd_count',
            'SUM(CASE WHEN request.status = :approved AND UPPER(request.currency) = \'BDT\' THEN 1 ELSE 0 END) as approved_bdt_count',
            ])
            .setParameter('approved', VerificationRequestStatus.APPROVED)
            .setParameter('pending', [VerificationRequestStatus.PENDING, VerificationRequestStatus.AWAITING_EMAIL_VERIFICATION])
            .setParameter('rejected', VerificationRequestStatus.REJECTED)
            .groupBy('plan.id')
            .getRawMany();

        return {
            subscription: subscriptionPlans,
            verification: verificationPlans,
        };
        }

    async getTopUsers(
        range: TimeRange,
        limit: number = 10,
        customStart?: Date,
        customEnd?: Date,
    ): Promise<TopUser[]> {
        const { start, end } = this.getDateRange(range, customStart, customEnd);

        const subscriptionUsers = await this.subscriptionRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.user', 'user')
            .where('request.created_at BETWEEN :start AND :end', { start, end })
            .andWhere('request.status = :status', { status: SubscriptionRequestStatus.APPROVED })
            .select([
                'user.id as user_id',
                'user.name as user_name',
                'user.email as user_email',
                'user.user_id as user_code',
                // ✅ FIX: Use UPPER() function to handle case-insensitive comparison
                'SUM(CASE WHEN UPPER(request.payment_currency) = \'USD\' THEN request.amount ELSE 0 END) as total_usd',
                'SUM(CASE WHEN UPPER(request.payment_currency) = \'BDT\' THEN request.amount ELSE 0 END) as total_bdt',
                'COUNT(*) as transaction_count',
            ])
            .groupBy('user.id')
            .orderBy('total_usd', 'DESC')
            .addOrderBy('total_bdt', 'DESC')
            .limit(limit)
            .getRawMany();

        const verificationUsers = await this.verificationRepo
            .createQueryBuilder('request')
            .leftJoinAndSelect('request.user', 'user')
            .where('request.created_at BETWEEN :start AND :end', { start, end })
            .andWhere('request.status = :status', { status: VerificationRequestStatus.APPROVED })
            .select([
                'user.id as user_id',
                'user.name as user_name',
                'user.email as user_email',
                'user.user_id as user_code',
                // ✅ FIX: Use UPPER() function to handle case-insensitive comparison
                'SUM(CASE WHEN UPPER(request.currency) = \'USD\' THEN request.amount ELSE 0 END) as total_usd',
                'SUM(CASE WHEN UPPER(request.currency) = \'BDT\' THEN request.amount ELSE 0 END) as total_bdt',
                'COUNT(*) as transaction_count',
            ])
            .groupBy('user.id')
            .orderBy('total_usd', 'DESC')
            .addOrderBy('total_bdt', 'DESC')
            .limit(limit)
            .getRawMany();

        // Combine and sort
        const userMap = new Map < string, TopUser> ();

        [...subscriptionUsers, ...verificationUsers].forEach(user => {
            const key = user.user_id;
            if (userMap.has(key)) {
                const existing = userMap.get(key)!;
                existing.total_usd += Number(user.total_usd || 0);
                existing.total_bdt += Number(user.total_bdt || 0);
                existing.transaction_count += Number(user.transaction_count || 0);
            } else {
                userMap.set(key, {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    user_email: user.user_email,
                    user_code: user.user_code,
                    total_usd: Number(user.total_usd || 0),
                    total_bdt: Number(user.total_bdt || 0),
                    transaction_count: Number(user.transaction_count || 0),
                });
            }
        });

        return Array.from(userMap.values())
            .sort((a, b) => b.total_usd - a.total_usd)
            .slice(0, limit);
    }

    async getDailyRevenue(
        range: TimeRange,
        customStart?: Date,
        customEnd?: Date,
    ): Promise<DailyRevenueItem[]> {
        const { start, end } = this.getDateRange(range, customStart, customEnd);
        const days: DailyRevenueItem[] = [];

        // Generate daily data
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);

            const subscriptionRevenue = await this.subscriptionRepo
                .createQueryBuilder('request')
                .where('request.created_at BETWEEN :dayStart AND :dayEnd', { dayStart, dayEnd })
                .andWhere('request.status = :status', { status: SubscriptionRequestStatus.APPROVED })
                .select([
                    // ✅ FIX: Use UPPER() function to handle case-insensitive comparison
                    'SUM(CASE WHEN UPPER(request.payment_currency) = \'USD\' THEN request.amount ELSE 0 END) as usd',
                    'SUM(CASE WHEN UPPER(request.payment_currency) = \'BDT\' THEN request.amount ELSE 0 END) as bdt',
                ])
                .getRawOne();

            const verificationRevenue = await this.verificationRepo
                .createQueryBuilder('request')
                .where('request.created_at BETWEEN :dayStart AND :dayEnd', { dayStart, dayEnd })
                .andWhere('request.status = :status', { status: VerificationRequestStatus.APPROVED })
                .select([
                    // ✅ FIX: Use UPPER() function to handle case-insensitive comparison
                    'SUM(CASE WHEN UPPER(request.currency) = \'USD\' THEN request.amount ELSE 0 END) as usd',
                    'SUM(CASE WHEN UPPER(request.currency) = \'BDT\' THEN request.amount ELSE 0 END) as bdt',
                ])
                .getRawOne();

            days.push({
                date: currentDate.toISOString().split('T')[0],
                subscription: {
                    usd: Number(subscriptionRevenue?.usd || 0),
                    bdt: Number(subscriptionRevenue?.bdt || 0),
                },
                verification: {
                    usd: Number(verificationRevenue?.usd || 0),
                    bdt: Number(verificationRevenue?.bdt || 0),
                },
                total: {
                    usd: Number(subscriptionRevenue?.usd || 0) + Number(verificationRevenue?.usd || 0),
                    bdt: Number(subscriptionRevenue?.bdt || 0) + Number(verificationRevenue?.bdt || 0),
                },
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    }

    async getSummaryReport(
        range: TimeRange,
        customStart?: Date,
        customEnd?: Date,
    ): Promise<SummaryReport> {
        const [overview, planBreakdown, topUsers, dailyRevenue] = await Promise.all([
            this.getAccountingOverview(range, customStart, customEnd),
            this.getPlanWiseBreakdown(range, customStart, customEnd),
            this.getTopUsers(range, 10, customStart, customEnd),
            this.getDailyRevenue(range, customStart, customEnd),
        ]);

        return {
            overview,
            planBreakdown,
            topUsers,
            dailyRevenue,
            generatedAt: new Date(),
            range: {
                type: range,
                start: customStart || this.getDateRange(range).start,
                end: customEnd || this.getDateRange(range).end,
            },
        };
    }
}