export enum BillingCycle {
  MONTHLY = 'per month',
  QUARTERLY = 'per quarter',
  YEARLY = 'per year',
}

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  EXPIRED = 'Expired',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
}

export enum SubscriptionRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export enum PlanType {
  STARTER = 'Starter',
  GROWTH = 'Growth',
  PROFESSIONAL = 'Professional',
  BUSINESS = 'Business',
  CUSTOM = 'Custom',
}

// ইউজার লিমিটের জন্য Enum (admin custom input দিতে পারবে)
export enum UserLimitType {
  ONE = '1',
  TWO = '2',
  FIVE = '5',
  TEN = '10',
  TWENTY = '20',
  UNLIMITED = 'unlimited',
  CUSTOM = 'custom', // admin চাইলে custom সংখ্যা দিতে পারবে
}

export enum TrackingPermission {
  CAN_TRACK = 'can_track',
  CANNOT_TRACK = 'cannot_track',
}
