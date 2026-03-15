// ট্রানজেকশনের ধরন
export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  VERIFICATION = 'verification',
  ADD_FUND = 'add_fund'
}

// ট্রানজেকশন স্ট্যাটাস
export enum TransactionStatus {
  PENDING = 'pending',
  AUTO_APPROVED = 'auto_approved',
  APPROVED = 'approved',
  ESCALATED = 'escalated',
  REJECTED = 'rejected'
}

// ট্রানজেকশন ফিল্টার ইন্টারফেস
export interface TransactionFilter {
  userId?: string;
  username?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  currency?: 'usd' | 'bdt';
  paymentType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  days?: number;
  // নতুন ফিল্ড যোগ করুন
  transactionId?: string;
  paymentMethod?: string;
  paymentMethodType?: string;
}

// ট্রানজেকশন স্ট্যাটস ইন্টারফেস
export interface TransactionStats {
  totalUsd: number;
  totalBdt: number;
  byType: {
    [key in TransactionType]?: {
      count: number;
      usd: number;
      bdt: number;
      byStatus: {
        [key in TransactionStatus]?: {
          count: number;
          usd: number;
          bdt: number;
        }
      }
    }
  };
  userCreditBalance?: number;
}

// ট্রানজেকশন রেসপন্স ইন্টারফেস
export interface TransactionResponse {
  data: any[];
  total: number;
  stats: TransactionStats;
  page: number;
  limit: number;
}
