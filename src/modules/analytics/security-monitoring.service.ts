// Replace the entire file with this fixed version:

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SecurityEvent, SecurityEventType, SecurityLevel } from './entities/security-event.entity';
import { BlockedIP, BlockReason, BlockAction } from './entities/blocked-ip.entity';
import { Request } from 'express';
import * as geoip from 'geoip-lite';
import * as useragent from 'useragent';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'security',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class SecurityMonitoringService {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SecurityMonitoringService.name);

  constructor(
    @InjectRepository(SecurityEvent)
    private securityRepository: Repository<SecurityEvent>,
    @InjectRepository(BlockedIP)
    private blockedIpRepository: Repository<BlockedIP>,
  ) {}

  // Monitor incoming request for attacks
  async monitorRequest(req: Request): Promise<{
    isBlocked: boolean;
    securityEvent?: SecurityEvent;
    blockInfo?: BlockedIP;
  }> {
    try {
      const clientIp = this.getClientIp(req);
      
      // Check if IP is already blocked
      const blockedIp = await this.blockedIpRepository.findOne({
        where: { 
          ip_address: clientIp,
          is_active: true 
        }
      });

      if (blockedIp) {
        if (blockedIp.expires_at && blockedIp.expires_at < new Date()) {
          // Block expired
          blockedIp.is_active = false;
          await this.blockedIpRepository.save(blockedIp);
        } else {
          return { isBlocked: true, blockInfo: blockedIp };
        }
      }

      // Check for brute force attack
      const bruteForce = await this.detectBruteForce(req);
      if (bruteForce) {
        const event = await this.createSecurityEvent({
          type: SecurityEventType.BRUTE_FORCE_ATTEMPT,
          level: SecurityLevel.HIGH,
          req,
          metadata: { attempts: bruteForce.attempts }
        });

        if (bruteForce.attempts > 10) {
          // Auto-block after 10 attempts
          await this.blockIp(clientIp, BlockReason.BRUTE_FORCE, 'Auto-blocked after multiple failed attempts');
        }

        return { isBlocked: true, securityEvent: event || undefined };
      }

      // Check for SQL injection
      const sqlInjection = this.detectSQLInjection(req);
      if (sqlInjection) {
        const event = await this.createSecurityEvent({
          type: SecurityEventType.SQL_INJECTION_ATTEMPT,
          level: SecurityLevel.CRITICAL,
          req,
          metadata: { pattern: sqlInjection }
        });

        if (event) {
          await this.blockIp(clientIp, BlockReason.SQL_INJECTION, 'SQL injection attempt detected');
        }
        return { isBlocked: true, securityEvent: event || undefined };
      }

      // Check for XSS
      const xss = this.detectXSS(req);
      if (xss) {
        const event = await this.createSecurityEvent({
          type: SecurityEventType.XSS_ATTEMPT,
          level: SecurityLevel.HIGH,
          req,
          metadata: { pattern: xss }
        });

        if (event) {
          await this.blockIp(clientIp, BlockReason.XSS_ATTEMPT, 'XSS attempt detected');
        }
        return { isBlocked: true, securityEvent: event || undefined };
      }

      // Check rate limit
      const rateLimit = await this.checkRateLimit(req);
      if (rateLimit.exceeded) {
        const event = await this.createSecurityEvent({
          type: SecurityEventType.RATE_LIMIT_EXCEEDED,
          level: SecurityLevel.MEDIUM,
          req,
          metadata: { 
            requests: rateLimit.count,
            limit: rateLimit.limit 
          }
        });

        if (rateLimit.count > 100) {
          // Auto-block for excessive requests
          await this.blockIp(clientIp, BlockReason.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded multiple times');
        }

        return { isBlocked: true, securityEvent: event || undefined };
      }

      // Check for suspicious geographic location
      const geo = this.checkGeographicLocation(req);
      if (geo.suspicious) {
        await this.createSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_LOGIN,
          level: SecurityLevel.MEDIUM,
          req,
          metadata: { 
            country: geo.country,
            reason: geo.reason 
          }
        });
      }

      // Check for VPN/Proxy
      const vpn = await this.detectVPN(req);
      if (vpn) {
        await this.createSecurityEvent({
          type: SecurityEventType.VPN_DETECTED,
          level: SecurityLevel.MEDIUM,
          req,
          metadata: { vpn: true }
        });
      }

      return { isBlocked: false };
    } catch (error) {
      this.logger.error('Error monitoring request:', error);
      return { isBlocked: false };
    }
  }

  // Detect brute force attacks
  private async detectBruteForce(req: Request): Promise<{ attempts: number } | null> {
    try {
      const clientIp = this.getClientIp(req);
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

      const attempts = await this.securityRepository.count({
        where: {
          ip_address: clientIp,
          event_type: SecurityEventType.MULTIPLE_FAILED_LOGINS,
          timestamp: MoreThan(fiveMinAgo)
        }
      });

      return attempts > 5 ? { attempts } : null;
    } catch (error) {
      this.logger.error('Error detecting brute force:', error);
      return null;
    }
  }

  // Detect SQL injection patterns
  private detectSQLInjection(req: Request): string | null {
    try {
      const patterns = [
        /(\bSELECT\b.*\bFROM\b)|(\bINSERT\b.*\bINTO\b)|(\bUPDATE\b.*\bSET\b)|(\bDELETE\b.*\bFROM\b)/i,
        /(\bUNION\b.*\bSELECT\b)/i,
        /(\bDROP\b.*\bTABLE\b)/i,
        /(';\s*DROP\s+TABLE)/i,
        /(\bOR\b.*=.*--)/i,
        /(\bAND\b.*=.*--)/i
      ];

      const searchIn = [
        ...Object.values(req.query || {}).map(v => String(v)),
        ...Object.values(req.body || {}).map(v => String(v)),
        req.url
      ];

      for (const value of searchIn) {
        for (const pattern of patterns) {
          if (pattern.test(value)) {
            return pattern.source;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Detect XSS patterns
  private detectXSS(req: Request): string | null {
    try {
      const patterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
        /javascript:/i,
        /onerror\s*=/i,
        /onload\s*=/i,
        /alert\s*\(/i,
        /eval\s*\(/i,
        /<iframe\b/i
      ];

      const searchIn = [
        ...Object.values(req.query || {}).map(v => String(v)),
        ...Object.values(req.body || {}).map(v => String(v)),
        req.url
      ];

      for (const value of searchIn) {
        for (const pattern of patterns) {
          if (pattern.test(value)) {
            return pattern.source;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Check rate limiting
  private async checkRateLimit(req: Request): Promise<{ exceeded: boolean; count: number; limit: number }> {
    try {
      const clientIp = this.getClientIp(req);
      const oneMinAgo = new Date(Date.now() - 60 * 1000);

      const requestCount = await this.securityRepository.count({
        where: {
          ip_address: clientIp,
          timestamp: MoreThan(oneMinAgo)
        }
      });

      let limit = 60;
      if (req.path.includes('/auth/login')) {
        limit = 5;
      } else if (req.path.includes('/api/')) {
        limit = 100;
      }

      return {
        exceeded: requestCount > limit,
        count: requestCount,
        limit
      };
    } catch (error) {
      return { exceeded: false, count: 0, limit: 60 };
    }
  }

  // Check geographic location
  private checkGeographicLocation(req: Request): { suspicious: boolean; country?: string; reason?: string } {
    try {
      const clientIp = this.getClientIp(req);
      const geo = geoip.lookup(clientIp);

      if (!geo) {
        return { suspicious: false };
      }

      const blockedCountries = ['KP', 'IR', 'SY', 'CU'];
      if (blockedCountries.includes(geo.country)) {
        return {
          suspicious: true,
          country: geo.country,
          reason: 'Country blocked'
        };
      }

      return { suspicious: false };
    } catch (error) {
      return { suspicious: false };
    }
  }

  // Detect VPN/Proxy
  private async detectVPN(req: Request): Promise<boolean> {
    try {
      const clientIp = this.getClientIp(req);
      const vpnRanges = [
        /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./
      ];

      for (const range of vpnRanges) {
        if (range.test(clientIp)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Block an IP address
  async blockIp(
    ipAddress: string,
    reason: BlockReason,
    description: string,
    duration?: number // in minutes, null for permanent
  ): Promise<BlockedIP | null> {
    try {
      const expiresAt = duration ? new Date(Date.now() + duration * 60 * 1000) : null;

      let blockedIp = await this.blockedIpRepository.findOne({
        where: { ip_address: ipAddress }
      });

      if (blockedIp) {
        blockedIp.is_active = true;
        blockedIp.reason = reason;
        blockedIp.description = description;
        blockedIp.expires_at = expiresAt;
        blockedIp.attempt_count = (blockedIp.attempt_count || 0) + 1;

        const saved = await this.blockedIpRepository.save(blockedIp);

        // Emit via WebSocket
        if (this.server) {
          this.server.emit('ip-blocked', saved);
        }

        return saved;
      } else {
        const newBlockedIp = new BlockedIP(); // ✅ Create instance directly
        newBlockedIp.ip_address = ipAddress;
        newBlockedIp.reason = reason;
        newBlockedIp.description = description;
        newBlockedIp.expires_at = expiresAt;
        newBlockedIp.action = BlockAction.AUTO_BLOCK;
        newBlockedIp.is_active = true;
        newBlockedIp.attempt_count = 1;

        const saved = await this.blockedIpRepository.save(newBlockedIp);

        // Emit via WebSocket
        if (this.server) {
          this.server.emit('ip-blocked', saved);
        }

        return saved;
      }
    } catch (error) {
      this.logger.error('Error blocking IP:', error);
      return null;
    }
  }

  // Unblock an IP
  async unblockIp(id: string, adminId: string, reason: string): Promise<BlockedIP | null> {
    try {
      const blockedIp = await this.blockedIpRepository.findOne({ where: { id } });
      if (!blockedIp) return null;

      blockedIp.is_active = false;
      blockedIp.unblocked_at = new Date();
      blockedIp.unblocked_by = adminId;
      blockedIp.unblock_reason = reason;

      return await this.blockedIpRepository.save(blockedIp);
    } catch (error) {
      this.logger.error('Error unblocking IP:', error);
      return null;
    }
  }

  // Get client IP from request
  private getClientIp(req: Request): string {
    try {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
      }
      
      const realIp = req.headers['x-real-ip'];
      if (realIp) {
        return Array.isArray(realIp) ? realIp[0] : realIp;
      }

      return req.ip || req.connection?.remoteAddress || '0.0.0.0';
    } catch (error) {
      return '0.0.0.0';
    }
  }

  // Create security event
  private async createSecurityEvent(data: {
    type: SecurityEventType;
    level: SecurityLevel;
    req: Request;
    metadata?: any;
  }): Promise<SecurityEvent | null> {
    try {
      const clientIp = this.getClientIp(data.req);
      const geo = geoip.lookup(clientIp);
      const agent = useragent.parse(data.req.headers['user-agent'] || '');

      const newEvent = new SecurityEvent();
      newEvent.event_type = data.type;
      newEvent.security_level = data.level;
      newEvent.ip_address = clientIp;
      newEvent.user_agent = data.req.headers['user-agent'] || '';
      newEvent.platform = agent.os.toString();
      newEvent.browser = agent.toAgent();
      newEvent.device_type = agent.device.toString();
      newEvent.endpoint = data.req.path;
      newEvent.method = data.req.method;
      newEvent.headers = data.req.headers;
      newEvent.request_data = {
        query: data.req.query,
        body: data.req.body,
        params: data.req.params
      };
      // Use type assertion for nullable fields
      newEvent.country = (geo?.country || null) as any;
      newEvent.city = (geo?.city || null) as any;
      newEvent.latitude = (geo?.ll?.[0] || null) as any;
      newEvent.longitude = (geo?.ll?.[1] || null) as any;
      newEvent.attempt_count = 1;
      newEvent.is_resolved = false;
      newEvent.timestamp = new Date();

      const saved = await this.securityRepository.save(newEvent);

      // Emit via WebSocket
      if (this.server) {
        this.server.emit('security-event', saved);
      }

      return saved;
    } catch (error) {
      this.logger.error('Error creating security event:', error);
      return null;
    }
  }


  // Get recent security events
  async getRecentSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
    try {
      return await this.securityRepository.find({
        order: { timestamp: 'DESC' },
        take: limit,
      });
    } catch (error) {
      return [];
    }
  }

  // Get attack statistics
  async getAttackStats(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [lastHour, lastDay, total, byType, byCountry] = await Promise.all([
        this.securityRepository.count({ where: { timestamp: MoreThan(oneHourAgo) } }),
        this.securityRepository.count({ where: { timestamp: MoreThan(oneDayAgo) } }),
        this.securityRepository.count(),
        this.securityRepository
          .createQueryBuilder('event')
          .select('event_type', 'type')
          .addSelect('COUNT(*)', 'count')
          .where('timestamp > :time', { time: oneDayAgo })
          .groupBy('event_type')
          .getRawMany(),
        this.securityRepository
          .createQueryBuilder('event')
          .select('country', 'country')
          .addSelect('COUNT(*)', 'count')
          .where('timestamp > :time', { time: oneDayAgo })
          .andWhere('country IS NOT NULL')
          .groupBy('country')
          .orderBy('count', 'DESC')
          .limit(10)
          .getRawMany(),
      ]);

      return { lastHour, lastDay, total, byType, byCountry };
    } catch (error) {
      return { lastHour: 0, lastDay: 0, total: 0, byType: [], byCountry: [] };
    }
  }

  // Get blocked IPs
  async getBlockedIPs(activeOnly: boolean = true): Promise<BlockedIP[]> {
    try {
      const where: any = { is_active: activeOnly };
      return await this.blockedIpRepository.find({ where, order: { created_at: 'DESC' } });
    } catch (error) {
      return [];
    }
  }
}