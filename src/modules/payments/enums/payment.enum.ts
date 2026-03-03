export enum PaymentMethodType {
  BANK = 'bank',
  MOBILE = 'mobile',
  CASH = 'cash',
  CARD = 'card',
  CRYPTO = 'crypto'
}

export enum PaymentCategory {
  BOTH = 'both',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal'
}

export enum PaymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum FundRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  FEE = 'fee',
  REFUND = 'refund',
  SUBSCRIPTION = 'subscription'
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  PROCESSING = 'processing',
  FAILED = 'failed'
}
