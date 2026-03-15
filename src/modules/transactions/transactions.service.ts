import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { SubscriptionRequest } from '../subscriptions/entities/subscription-request.entity';
import { VerificationRequest } from '../verification/entities/verification-request.entity';
import { TransactionType, TransactionStatus, TransactionFilter, TransactionStats, TransactionResponse } from './interfaces/transaction.interface';
import { SubscriptionStatus } from '../subscriptions/enums/subscription.enum';
import { User } from '../users/entities/user.entity'; // User entity import
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity'; 
import { getBangladeshDateRange, getLastDaysRange, getDateRangeFromStrings } from './date-utils';


// Transaction response types
interface SubscriptionInfo {
  plan_name: string;
  plan_credits: number;
  status: string;
  type: 'active' | 'pending_request';
  started_at?: Date;
  expires_at?: Date;
  auto_renew?: boolean;
  requested_at?: Date;
}

interface UserInfoResponse {
  user: any;
  current_subscription: SubscriptionInfo | null;
  verification_info: any;
}


@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(SubscriptionRequest)
  private subscriptionRepo: Repository<SubscriptionRequest>,
    @InjectRepository(VerificationRequest)
    private verificationRepo: Repository<VerificationRequest>,
    @InjectRepository(User) // নতুন User repository
    private userRepo: Repository<User>,
    @InjectRepository(UserSubscription) // নতুন UserSubscription repository
    private userSubscriptionRepo: Repository<UserSubscription>,
  ) { }

  // নতুন মেথড - User Info
 async getUserInfo(identifier: string): Promise<any> {
  let user: User | null = null;
  
  // UUID validation regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // 1. প্রথমে UUID হিসেবে চেক করুন (যদি ভ্যালিড UUID হয়)
  if (uuidRegex.test(identifier)) {
    user = await this.userRepo.findOne({
      where: { id: identifier }
    });
    if (user) return this.formatUserInfo(user);
  }
  
  // 2. তারপর user_id দিয়ে খুঁজুন
  user = await this.userRepo.findOne({
    where: { user_id: identifier }
  });
  if (user) return this.formatUserInfo(user);
  
  // 3. তারপর username দিয়ে খুঁজুন
  user = await this.userRepo.findOne({
    where: { username: identifier }
  });
  if (user) return this.formatUserInfo(user);
  
  // 4. সবশেষে email দিয়ে খুঁজুন (lowercase)
  user = await this.userRepo.findOne({
    where: { email: identifier.toLowerCase() }
  });
  if (user) return this.formatUserInfo(user);
  
  throw new Error('User not found');
}

  private async formatUserInfo(user: User): Promise<UserInfoResponse> {
    // Current active subscription খুঁজুন
    const activeSubscription = await this.userSubscriptionRepo.findOne({
      where: {
        user_id: user.id,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });

    // Pending subscription request খুঁজুন - Raw Value ব্যবহার করুন
    const pendingSubscriptionRequest = await this.subscriptionRepo.findOne({
      where: {
        user_id: user.id,
        status: 'pending' as any, // 'as any' দিয়ে টাইপ কাস্ট
      },
      relations: ['plan'],
      order: { created_at: 'DESC' },
    });

    // User verification status
    const verificationRequest = await this.verificationRepo.findOne({
      where: { user_id: user.id },
      order: { created_at: 'DESC' },
    });

    // Determine subscription status to display
    let displaySubscriptionStatus = user.subscription_status;
    let displaySubscription: SubscriptionInfo | null = null;

    if (activeSubscription) {
      // Active subscription exists
      displaySubscriptionStatus = 'active';
      displaySubscription = {
        plan_name: activeSubscription.plan?.name || 'Unknown Plan',
        plan_credits: activeSubscription.plan?.credits || 0,
        started_at: activeSubscription.start_date,
        expires_at: activeSubscription.end_date,
        status: activeSubscription.status,
        auto_renew: activeSubscription.auto_renew,
        type: 'active'
      };
    } else if (pendingSubscriptionRequest) {
      // No active subscription but has pending request
      displaySubscriptionStatus = 'pending';
      displaySubscription = {
        plan_name: pendingSubscriptionRequest.plan?.name || 'Unknown Plan',
        plan_credits: pendingSubscriptionRequest.plan?.credits || 0,
        requested_at: pendingSubscriptionRequest.created_at,
        status: 'pending',
        type: 'pending_request'
      };
    } else {
      // No subscription at all
      displaySubscriptionStatus = user.subscription_status || 'inactive';
      displaySubscription = null;
    }

    return {
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        verified: user.verified,
        verification_status: user.verification_status || (verificationRequest?.status || 'pending'),
        subscription_status: displaySubscriptionStatus,
        credit_balance: parseFloat(user.credit_balance?.toString() || '0'),
        join_date: user.join_date,
        country: user.country,
        profile_picture_url: user.profile_picture_url,
        is_banned: user.is_banned,
      },
      current_subscription: displaySubscription,
      verification_info: verificationRequest ? {
        status: verificationRequest.status,
        risk_level: verificationRequest.risk_level,
        submitted_at: verificationRequest.created_at,
        processed_at: verificationRequest.processed_at,
      } : null,
    };
  }

  async getAllTransactions(
    page: number = 1,
    limit: number = 20,
    filters: TransactionFilter = {}
  ): Promise<TransactionResponse> {
    // Date filter prepare - বাংলাদেশ সময় অনুযায়ী
    let dateFilter: any = {};

    // যদি dateFrom এবং dateTo দেওয়া থাকে
    if (filters.dateFrom && filters.dateTo) {
      try {
        const { start, end } = getDateRangeFromStrings(
          filters.dateFrom.toISOString().split('T')[0],
          filters.dateTo.toISOString().split('T')[0]
        );
        dateFilter.created_at = Between(start, end);
        console.log('Date range filter (BD time):', {
          from: filters.dateFrom,
          to: filters.dateTo,
          utcStart: start,
          utcEnd: end
        });
      } catch (error) {
        console.error('Date range parsing error:', error);
      }
    }
    // যদি days দেওয়া থাকে (যেমন 7, 15, 30, 90)
    else if (filters.days) {
      const { start, end } = getLastDaysRange(filters.days);
      dateFilter.created_at = Between(start, end);
      console.log(`Last ${filters.days} days filter (BD time):`, {
        utcStart: start,
        utcEnd: end
      });
    }

    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // User filter - শুধুমাত্র valid UUID থাকলে database level এ filter
    let userWhere: any = {};
    let needsPostFilter = false;
    let searchTerm = '';

    // যদি transactionId, paymentMethod, paymentMethodType দেওয়া থাকে, তাহলে post-filter প্রয়োজন
    if (filters.transactionId || filters.paymentMethod || filters.paymentMethodType) {
      needsPostFilter = true;
      searchTerm = filters.transactionId || filters.paymentMethod || filters.paymentMethodType || '';
      searchTerm = searchTerm.toLowerCase();
    }

    if (filters.userId) {
      if (uuidRegex.test(filters.userId)) {
        userWhere = { user_id: filters.userId };
        console.log('Valid UUID, applying database filter:', filters.userId);
      } else {
        console.log('Invalid UUID, will filter later:', filters.userId);
        searchTerm = filters.userId.toLowerCase();
        needsPostFilter = true;
      }
    }

    if (filters.username) {
      searchTerm = filters.username.toLowerCase();
      needsPostFilter = true;
    }

    // আলাদাভাবে subscription এবং verification এর জন্য প্রমিস তৈরি করি
    let subscriptionPromise: Promise<any[]>;
    let verificationPromise: Promise<any[]>;

    // Subscription প্রমিস
    if (filters.status) {
      const statusValue = filters.status.toString().toLowerCase();

      // Subscription এর জন্য status mapping
      if (statusValue === 'rejected') {
        subscriptionPromise = this.subscriptionRepo.find({
          where: { ...userWhere, ...dateFilter, status: 'declined' },
          relations: ['user', 'plan', 'processed_by'],
          order: { created_at: 'DESC' },
        });
      } else if (statusValue === 'escalated') {
        subscriptionPromise = Promise.resolve([]);
      } else {
        const subscriptionValidStatuses = ['pending', 'approved'];
        if (subscriptionValidStatuses.includes(statusValue)) {
          subscriptionPromise = this.subscriptionRepo.find({
            where: { ...userWhere, ...dateFilter, status: statusValue },
            relations: ['user', 'plan', 'processed_by'],
            order: { created_at: 'DESC' },
          });
        } else {
          subscriptionPromise = Promise.resolve([]);
        }
      }
    } else {
      subscriptionPromise = this.subscriptionRepo.find({
        where: { ...userWhere, ...dateFilter },
        relations: ['user', 'plan', 'processed_by'],
        order: { created_at: 'DESC' },
      });
    }

    // Verification প্রমিস
    if (filters.status) {
      const statusValue = filters.status.toString().toLowerCase();
      const verificationValidStatuses = ['pending', 'approved', 'rejected', 'escalated', 'awaiting_email_verification'];

      if (verificationValidStatuses.includes(statusValue)) {
        verificationPromise = this.verificationRepo.find({
          where: { ...userWhere, ...dateFilter, status: statusValue },
          relations: ['user', 'plan', 'processed_by'],
          order: { created_at: 'DESC' },
        });
      } else {
        verificationPromise = Promise.resolve([]);
      }
    } else {
      verificationPromise = this.verificationRepo.find({
        where: { ...userWhere, ...dateFilter },
        relations: ['user', 'plan', 'processed_by'],
        order: { created_at: 'DESC' },
      });
    }

    // সব প্রমিস একসাথে রান করান
    const [subscriptions, verification] = await Promise.all([
      subscriptionPromise,
      verificationPromise,
    ]);

    // Transform to unified format
    let allTransactions = [
      ...subscriptions.map(s => {
        const transformed = this.transformSubscription(s);
        return transformed;
      }),
      ...verification.map(v => {
        const transformed = this.transformVerification(v);
        return transformed;
      }),
    ];

    {/*
    // **Post-filter by username or non-UUID userId- Similar match এর জন্য**
    if (needsPostFilter && searchTerm) {
      console.log(`Applying post-filter with term: ${searchTerm}`);
      allTransactions = allTransactions.filter(t => {
        const userName = t.user?.username?.toLowerCase() || '';
        const userFullName = t.user?.name?.toLowerCase() || '';
        const userEmail = t.user?.email?.toLowerCase() || '';
        const userId = t.user?.user_id?.toLowerCase() || t.user_id?.toLowerCase() || '';

        return userName.includes(searchTerm) ||
          userFullName.includes(searchTerm) ||
          userEmail.includes(searchTerm) ||
          userId.includes(searchTerm);
      });
      console.log(`After post-filter: ${allTransactions.length} transactions`);
    }
*/}

    // **Post-filter by username or non-UUID userId - Exact match এর জন্য**
    // Post-filter by username, userId, email, full name, or transaction_id
    // **Post-filter by search term - এক্ষেত্রে সব ফিল্ডে খুঁজবে**
    if (needsPostFilter && searchTerm) {
      console.log(`Applying post-filter with term: ${searchTerm}`);
      allTransactions = allTransactions.filter(t => {
        const userName = t.user?.username?.toLowerCase() || '';
        const userFullName = t.user?.name?.toLowerCase() || '';
        const userEmail = t.user?.email?.toLowerCase() || '';
        const userId = t.user?.user_id?.toLowerCase() || t.user_id?.toLowerCase() || '';
        const transactionId = t.transaction_id?.toLowerCase() || '';
        const paymentMethod = t.payment_method?.toLowerCase() || '';
        const paymentMethodType = t.payment_method_type?.toLowerCase() || '';
        const paymentMethodName = t.payment_method_name?.toLowerCase() || '';

        // Check if searchTerm matches any field
        const matchesUserInfo =
          userName === searchTerm ||
          userFullName === searchTerm ||
          userEmail === searchTerm ||
          userId === searchTerm;

        const matchesTransaction =
          transactionId === searchTerm ||
          paymentMethod.includes(searchTerm) ||
          paymentMethodType.includes(searchTerm) ||
          paymentMethodName.includes(searchTerm);

        return matchesUserInfo || matchesTransaction;
      });
      console.log(`After post-filter: ${allTransactions.length} transactions`);

    }

    // Apply additional filters
    if (filters.type) {
      allTransactions = allTransactions.filter(t => t.type === filters.type);
    }

    if (filters.currency) {
      const currencyLower = filters.currency.toLowerCase();
      allTransactions = allTransactions.filter(t =>
        t.currency?.toLowerCase() === currencyLower
      );
    }

    if (filters.paymentType && filters.paymentType !== 'all') {
      const paymentTypeLower = filters.paymentType.toLowerCase();
      allTransactions = allTransactions.filter(t => {
        const methodType = t.payment_method_type?.toLowerCase() || '';
        const method = t.payment_method?.toLowerCase() || '';
        const methodName = t.payment_method_name?.toLowerCase() || '';

        return methodType.includes(paymentTypeLower) ||
          method.includes(paymentTypeLower) ||
          methodName.includes(paymentTypeLower);
      });
    }

    // Sort by date (newest first)
    allTransactions.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Calculate stats
    const stats = this.calculateStats(allTransactions, filters.userId);

    // Paginate
    const start = (page - 1) * limit;
    const paginatedData = allTransactions.slice(start, start + limit);

    return {
      data: paginatedData,
      total: allTransactions.length,
      stats,
      page,
      limit,
    };
  }

  async getUserTransactions(userId: string): Promise<any> {
    return this.getAllTransactions(1, 1000, { userId });
  }

  async getTransactionById(id: string, type: TransactionType): Promise<any> {
    if (type === TransactionType.SUBSCRIPTION) {
      const sub = await this.subscriptionRepo.findOne({
        where: { id },
        relations: ['user', 'plan', 'processed_by'],
      });
      return this.transformSubscription(sub);
    } else {
      const ver = await this.verificationRepo.findOne({
        where: { id },
        relations: ['user', 'plan', 'processed_by'],
      });
      return this.transformVerification(ver);
    }
  }

  async deleteTransaction(id: string, type: TransactionType): Promise<void> {
    if (type === TransactionType.SUBSCRIPTION) {
      await this.subscriptionRepo.delete(id);
    } else {
      await this.verificationRepo.delete(id);
    }
  }

  private transformSubscription(sub: any): any {
    const unifiedStatus = sub.status === 'declined' ? 'rejected' : sub.status;
    const amount = sub.amount || 0;
    const currency = sub.payment_currency?.toLowerCase() || 'usd';

    let usdAmount = 0;
    let bdtAmount = 0;

    if (currency === 'usd') {
      usdAmount = amount;
      bdtAmount = 0;
    } else if (currency === 'bdt') {
      usdAmount = 0;
      bdtAmount = amount;
    }

    // **রিটার্ন অবজেক্টে প্রপার্টি নামগুলি সঠিক করুন**
    return {
      id: sub.id,
      type: TransactionType.SUBSCRIPTION,
      typeLabel: 'Subscription',
      user: sub.user,
      user_id: sub.user_id,
      plan: sub.plan,
      amount: amount,
      currency: currency,
      usd_amount: usdAmount,    // এই নামে
      bdt_amount: bdtAmount,    // এই নামে
      payment_method: sub.payment_method,
      payment_method_type: sub.payment_method_type,
      payment_method_name: sub.payment_method_name,
      transaction_id: sub.transaction_id,
      status: unifiedStatus,
      approval_type: sub.approval_type,
      processed_by: sub.processed_by,
      processed_at: sub.processed_at,
      proof_fields: sub.proof_fields,
      proof_images: sub.proof_images,
      notes: sub.notes,
      admin_notes: sub.admin_notes,
      created_at: sub.created_at,
      updated_at: sub.updated_at,
    };
  }

  private transformVerification(ver: any): any {
    const amount = ver.amount || 0;
    const currency = ver.currency?.toLowerCase() || 'bdt';

    let usdAmount = 0;
    let bdtAmount = 0;

    if (currency === 'usd') {
      usdAmount = amount;
      bdtAmount = 0;
    } else if (currency === 'bdt') {
      usdAmount = 0;
      bdtAmount = amount;
    }

    return {
      id: ver.id,
      type: TransactionType.VERIFICATION,
      typeLabel: 'Verification',
      user: ver.user,
      user_id: ver.user_id,
      plan: ver.plan,
      amount: amount,
      usd_amount: usdAmount,
      bdt_amount: bdtAmount,
      currency: currency,
      payment_method: ver.payment_method,
      payment_method_type: ver.payment_method_type,
      payment_method_name: ver.payment_method_name,
      transaction_id: ver.transaction_id,
      status: ver.status,
      risk_level: ver.risk_level,
      processed_by: ver.processed_by,
      processed_at: ver.processed_at,
      document_responses: ver.document_responses,
      proof_fields: ver.proof_fields,
      proof_images: ver.proof_images,
      verification_email: ver.verification_email,
      email_verified: ver.email_verified,
      notes: ver.notes,
      admin_notes: ver.admin_notes,
      created_at: ver.created_at,
      updated_at: ver.updated_at,
    };
  }

  private calculateStats(transactions: any[], userId?: string) {
    const stats: any = {
      totalUsd: 0,
      totalBdt: 0,
      byType: {
        subscription: { count: 0, usd: 0, bdt: 0, byStatus: {} },
        verification: { count: 0, usd: 0, bdt: 0, byStatus: {} },
      },
    };


    transactions.forEach((t, index) => {
      const type = t.type;
      const status = t.status;

      // **string কে number এ কনভার্ট করুন**
      const usdAmount = parseFloat(t.usd_amount) || 0;
      const bdtAmount = parseFloat(t.bdt_amount) || 0;


      // Totals
      stats.totalUsd += usdAmount;
      stats.totalBdt += bdtAmount;

      // By type
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, usd: 0, bdt: 0, byStatus: {} };
      }

      stats.byType[type].count++;
      stats.byType[type].usd += usdAmount;
      stats.byType[type].bdt += bdtAmount;

      // By status
      if (!stats.byType[type].byStatus[status]) {
        stats.byType[type].byStatus[status] = { count: 0, usd: 0, bdt: 0 };
      }

      stats.byType[type].byStatus[status].count++;
      stats.byType[type].byStatus[status].usd += usdAmount;
      stats.byType[type].byStatus[status].bdt += bdtAmount;
    });

    // **ফাইনাল স্ট্যাটস গুলোকে number এ ফরম্যাট করুন**
    stats.totalUsd = parseFloat(stats.totalUsd.toFixed(2));
    stats.totalBdt = parseFloat(stats.totalBdt.toFixed(2));

    if (stats.byType.subscription) {
      stats.byType.subscription.usd = parseFloat(stats.byType.subscription.usd.toFixed(2));
      stats.byType.subscription.bdt = parseFloat(stats.byType.subscription.bdt.toFixed(2));

      Object.keys(stats.byType.subscription.byStatus).forEach(status => {
        stats.byType.subscription.byStatus[status].usd =
          parseFloat(stats.byType.subscription.byStatus[status].usd.toFixed(2));
        stats.byType.subscription.byStatus[status].bdt =
          parseFloat(stats.byType.subscription.byStatus[status].bdt.toFixed(2));
      });
    }

    if (stats.byType.verification) {
      stats.byType.verification.usd = parseFloat(stats.byType.verification.usd.toFixed(2));
      stats.byType.verification.bdt = parseFloat(stats.byType.verification.bdt.toFixed(2));

      Object.keys(stats.byType.verification.byStatus).forEach(status => {
        stats.byType.verification.byStatus[status].usd =
          parseFloat(stats.byType.verification.byStatus[status].usd.toFixed(2));
        stats.byType.verification.byStatus[status].bdt =
          parseFloat(stats.byType.verification.byStatus[status].bdt.toFixed(2));
      });
    }



    return stats;
  }


}