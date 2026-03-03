export enum ReportType {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  FAKE_ACCOUNT = 'fake_account',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  UNDERAGE = 'underage',
  IMPERSONATION = 'impersonation',
  SCAM = 'scam',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum ReportAction {
  WARNING = 'warning',
  TEMPORARY_BAN = 'temporary_ban',
  PERMANENT_BAN = 'permanent_ban',
  CONTENT_REMOVED = 'content_removed',
  NO_ACTION = 'no_action',
}
