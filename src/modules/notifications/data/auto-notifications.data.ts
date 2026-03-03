import { NotificationType, NotificationPriority, TargetAudience, DeliveryMethod, FrequencyType } from '../entities/notification.entity';

export const AUTO_NOTIFICATIONS = [
  // Account Notifications
  {
    title: 'Welcome to Our App!',
    content: 'Thank you for joining us, {{user_name}}! We\'re excited to have you on board. Get started by exploring our features.',
    type: NotificationType.ACCOUNT_CREATED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.NEW_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {
      user_name: '',
      user_email: ''
    }
  },
  {
    title: 'Account Verified Successfully',
    content: 'Congratulations {{user_name}}! Your account has been verified. You now have access to all features.',
    type: NotificationType.ACCOUNT_VERIFIED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.VERIFIED_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {
      user_name: ''
    }
  },
  {
    title: 'Account Temporarily Suspended',
    content: 'Your account has been temporarily suspended. Please contact support for more information.',
    type: NotificationType.ACCOUNT_BANNED,
    priority: NotificationPriority.HIGH,
    target_audience: TargetAudience.SPECIFIC_USER,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL, DeliveryMethod.PUSH],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {}
  },
  {
    title: 'Account Restored',
    content: 'Your account has been restored. You can now access all features normally.',
    type: NotificationType.ACCOUNT_UNBANNED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.SPECIFIC_USER,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    template_variables: {}
  },
  {
    title: 'Password Changed',
    content: 'Your password was successfully changed. If you didn\'t make this change, please contact support immediately.',
    type: NotificationType.PASSWORD_CHANGED,
    priority: NotificationPriority.HIGH,
    target_audience: TargetAudience.SPECIFIC_USER,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {}
  },
  {
    title: 'Profile Updated',
    content: 'Your profile information has been updated successfully.',
    type: NotificationType.PROFILE_UPDATED,
    priority: NotificationPriority.LOW,
    target_audience: TargetAudience.SPECIFIC_USER,
    delivery_methods: [DeliveryMethod.IN_APP],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: false,
    play_sound: false,
    template_variables: {}
  },

  // Subscription Notifications
  {
    title: 'Subscription Created',
    content: 'Your {{plan_name}} subscription has been created. Thank you for subscribing!',
    type: NotificationType.SUBSCRIPTION_CREATED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.ACTIVE_SUBSCRIBERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {
      plan_name: '',
      plan_price: ''
    }
  },
  {
    title: 'Subscription Activated',
    content: 'Your {{plan_name}} subscription is now active. Enjoy all premium features!',
    type: NotificationType.SUBSCRIPTION_ACTIVATED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.ACTIVE_SUBSCRIBERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    template_variables: {
      plan_name: ''
    }
  },
  {
    title: 'Subscription Expiring Soon',
    content: 'Your {{plan_name}} subscription will expire in {{days_left}} days. Renew now to continue enjoying premium features.',
    type: NotificationType.SUBSCRIPTION_EXPIRING,
    priority: NotificationPriority.HIGH,
    target_audience: TargetAudience.ACTIVE_SUBSCRIBERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL, DeliveryMethod.PUSH],
    frequency: FrequencyType.DAILY,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {
      plan_name: '',
      days_left: ''
    }
  },
  {
    title: 'Subscription Expired',
    content: 'Your {{plan_name}} subscription has expired. Renew now to reactivate your premium features.',
    type: NotificationType.SUBSCRIPTION_EXPIRED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.EXPIRED_SUBSCRIBERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    template_variables: {
      plan_name: ''
    }
  },
  {
    title: 'Free Trial Started',
    content: 'Your 7-day free trial has started! Explore all premium features risk-free.',
    type: NotificationType.TRIAL_STARTED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.TRIAL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    template_variables: {}
  },
  {
    title: 'Trial Ending Soon',
    content: 'Your free trial will end in {{days_left}} days. Subscribe now to keep enjoying premium features.',
    type: NotificationType.TRIAL_ENDING,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.TRIAL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL, DeliveryMethod.PUSH],
    frequency: FrequencyType.DAILY,
    image_url: null,
    show_popup: true,
    play_sound: true,
    template_variables: {
      days_left: ''
    }
  },

  // Payment Notifications
  {
    title: 'Payment Successful',
    content: 'Your payment of {{amount}} {{currency}} was successful. Thank you for your payment!',
    type: NotificationType.PAYMENT_SUCCESS,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.ALL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {
      amount: '',
      currency: ''
    }
  },
  {
    title: 'Payment Failed',
    content: 'Your payment of {{amount}} {{currency}} failed. Please update your payment method.',
    type: NotificationType.PAYMENT_FAILED,
    priority: NotificationPriority.HIGH,
    target_audience: TargetAudience.ALL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL, DeliveryMethod.PUSH],
    frequency: FrequencyType.DAILY,
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    template_variables: {
      amount: '',
      currency: ''
    }
  },
  {
    title: 'Payment Pending',
    content: 'Your payment of {{amount}} {{currency}} is being processed. We\'ll notify you once it\'s complete.',
    type: NotificationType.PAYMENT_PENDING,
    priority: NotificationPriority.LOW,
    target_audience: TargetAudience.ALL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: false,
    play_sound: false,
    template_variables: {
      amount: '',
      currency: ''
    }
  },
  {
    title: 'Payment Refunded',
    content: 'Your payment of {{amount}} {{currency}} has been refunded. It may take 5-7 business days to appear.',
    type: NotificationType.PAYMENT_REFUNDED,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.ALL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    template_variables: {
      amount: '',
      currency: ''
    }
  },

  // Report Notifications
  {
    title: 'Report Submitted',
    content: 'Your report against {{reported_user}} has been submitted. Our team will review it shortly.',
    type: NotificationType.REPORT_SUBMITTED,
    priority: NotificationPriority.LOW,
    target_audience: TargetAudience.SPECIFIC_USER,
    delivery_methods: [DeliveryMethod.IN_APP],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: false,
    play_sound: false,
    template_variables: {
      reported_user: ''
    }
  },
  {
    title: 'Report Resolved',
    content: 'The report you submitted has been resolved. Thank you for helping keep our community safe.',
    type: NotificationType.REPORT_RESOLVED,
    priority: NotificationPriority.LOW,
    target_audience: TargetAudience.SPECIFIC_USER,
    delivery_methods: [DeliveryMethod.IN_APP],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: false,
    play_sound: false,
    template_variables: {}
  },

  // System Notifications
  {
    title: 'System Update',
    content: 'We\'ve updated our system with new features and improvements. Check out what\'s new!',
    type: NotificationType.SYSTEM_UPDATE,
    priority: NotificationPriority.MEDIUM,
    target_audience: TargetAudience.ALL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL],
    frequency: FrequencyType.ONCE,
    image_url: null,
    show_popup: true,
    play_sound: true,
    action_text: 'See What\'s New',
    action_url: '/updates',
    template_variables: {}
  },
  {
    title: 'Scheduled Maintenance',
    content: 'We\'ll be performing scheduled maintenance on {{date}} from {{start_time}} to {{end_time}}. The app may be unavailable during this time.',
    type: NotificationType.MAINTENANCE_ALERT,
    priority: NotificationPriority.HIGH,
    target_audience: TargetAudience.ALL_USERS,
    delivery_methods: [DeliveryMethod.IN_APP, DeliveryMethod.EMAIL, DeliveryMethod.PUSH],
    frequency: FrequencyType.CUSTOM,
    frequency_details: {
      interval_hours: 24,
      start_date: undefined,
      end_date: undefined
    },
    image_url: null,
    show_popup: true,
    play_sound: true,
    vibrate: true,
    action_text: 'Learn More',
    action_url: '/maintenance',
    template_variables: {
      date: '',
      start_time: '',
      end_time: ''
    }
  }
];