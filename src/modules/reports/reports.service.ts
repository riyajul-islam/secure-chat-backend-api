import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportStatus } from './enums/report.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(reporterId: string, createDto: CreateReportDto): Promise<Report> {
    // Check if reported user exists
    const reportedUser = await this.userRepository.findOne({
      where: { id: createDto.reported_user_id },
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    // Check if user is trying to report themselves
    if (reporterId === createDto.reported_user_id) {
      throw new ForbiddenException('You cannot report yourself');
    }

    // Check for existing pending report
    const existingReport = await this.reportRepository.findOne({
      where: {
        reporter_id: reporterId,
        reported_id: createDto.reported_user_id,
        status: ReportStatus.PENDING,
      },
    });

    if (existingReport) {
      throw new ForbiddenException('You already have a pending report against this user');
    }

    const report = this.reportRepository.create({
      reporter_id: reporterId,
      reported_id: createDto.reported_user_id,
      type: createDto.type,
      reason: createDto.reason,
      description: createDto.description,
      evidence: createDto.evidence,
    });

    return this.reportRepository.save(report);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: ReportStatus,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.reportRepository.findAndCount({
      where,
      relations: ['reporter', 'reported', 'processed_by'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform data for response - user_id সহ
    const transformedData = data.map(report => ({
      id: report.id,
      reporter_id: report.reporter_id,
      reporter_name: report.reporter?.name || 'Unknown',
      reporter_user_id: report.reporter?.user_id || null, // ✅ user_id যোগ করুন
      reported_id: report.reported_id,
      reported_name: report.reported?.name || 'Unknown',
      reported_user_id: report.reported?.user_id || null, // ✅ user_id যোগ করুন
      type: report.type,
      reason: report.reason,
      description: report.description,
      evidence: report.evidence,
      status: report.status,
      action_taken: report.action_taken,
      admin_notes: report.admin_notes,
      created_at: report.created_at,
      processed_at: report.processed_at,
    }));

    return { data: transformedData, total, page, limit };
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'reported', 'processed_by'],
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async updateStatus(
      id: string,
      updateDto: UpdateReportStatusDto,
      adminId: string,
    ): Promise<Report> {
      const report = await this.findOne(id);

      report.status = updateDto.status;

      // Fix: Check if action_taken exists before assigning
      if (updateDto.action_taken) {
        report.action_taken = updateDto.action_taken;
      }

      // Fix: Use empty string if admin_notes is undefined
      report.admin_notes = updateDto.admin_notes || '';

      report.processed_by_id = adminId;
      report.processed_at = new Date();

      // If action is ban, update user's banned status
      if (updateDto.action_taken === 'temporary_ban' || updateDto.action_taken === 'permanent_ban') {
        await this.userRepository.update(report.reported_id, {
          is_banned: true,
        });
      }

      return this.reportRepository.save(report);
    }

  async getUserReports(userId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: [
        { reporter_id: userId },
        { reported_id: userId },
      ],
      relations: ['reporter', 'reported'],
      order: { created_at: 'DESC' },
    });
  }

  async getStats(): Promise<any> {
    const total = await this.reportRepository.count();
    const pending = await this.reportRepository.count({ where: { status: ReportStatus.PENDING } });
    const investigating = await this.reportRepository.count({ where: { status: ReportStatus.INVESTIGATING } });
    const resolved = await this.reportRepository.count({ where: { status: ReportStatus.RESOLVED } });

    return {
      total,
      pending,
      investigating,
      resolved,
    };
  }

  async deleteReport(id: string, adminId: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }
}
