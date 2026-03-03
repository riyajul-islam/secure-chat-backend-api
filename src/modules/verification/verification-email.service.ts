import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRequest, VerificationRequestStatus } from './entities/verification-request.entity';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';

@Injectable()
export class VerificationEmailService {
  constructor(
    @InjectRepository(VerificationRequest)
    private requestRepository: Repository<VerificationRequest>,
    private usersService: UsersService,
  ) {}

  // Generate 6-digit verification code
  generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send verification email (you'll need to implement your email service)
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    // TODO: Implement your email sending logic here
    // This could use nodemailer, SendGrid, AWS SES, etc.
    console.log(`Verification code for ${email}: ${code}`);
    
    // For now, we'll just log it. In production, you'd send an actual email.
    // Example using nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Verification" <verify@yourapp.com>',
      to: email,
      subject: 'Email Verification Code',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });
    */
  }

  // Start email verification process
  async startEmailVerification(requestId: string, email: string): Promise<void> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== VerificationRequestStatus.PENDING) {
      throw new BadRequestException('Cannot verify email for non-pending request');
    }

    const code = this.generateVerificationCode();
    const now = new Date();

    request.verification_email = email;
    request.email_verification_code = code;
    request.email_verification_sent_at = now;
    request.status = VerificationRequestStatus.AWAITING_EMAIL_VERIFICATION;

    await this.requestRepository.save(request);
    await this.sendVerificationEmail(email, code);
  }

  // Verify email code
  async verifyEmailCode(requestId: string, code: string): Promise<boolean> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== VerificationRequestStatus.AWAITING_EMAIL_VERIFICATION) {
      throw new BadRequestException('Request is not awaiting email verification');
    }

    // Check if code is expired (10 minutes)
    const sentAt = request.email_verification_sent_at;
    if (sentAt) {
      const now = new Date();
      const diffMinutes = (now.getTime() - sentAt.getTime()) / (1000 * 60);
      if (diffMinutes > 10) {
        throw new BadRequestException('Verification code expired. Please request a new one.');
      }
    }

    if (request.email_verification_code !== code) {
      return false;
    }

    // Code is correct
    request.email_verified = true;
    request.email_verified_at = new Date();
    request.status = VerificationRequestStatus.PENDING; // Back to pending for admin review
    request.email_verification_code = null; // Clear the code

    // Update user's email in their profile if it's different
    if (request.user_id && request.verification_email) {
      const user = await this.usersService.findById(request.user_id);
      if (user.email !== request.verification_email) {
        await this.usersService.update(request.user_id, {
          email: request.verification_email,
        });
      }
    }

    await this.requestRepository.save(request);
    return true;
  }

  // Resend verification code
  async resendVerificationCode(requestId: string): Promise<void> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== VerificationRequestStatus.AWAITING_EMAIL_VERIFICATION) {
      throw new BadRequestException('Request is not awaiting email verification');
    }

    if (!request.verification_email) {
      throw new BadRequestException('No email address found for verification');
    }

    const newCode = this.generateVerificationCode();
    request.email_verification_code = newCode;
    request.email_verification_sent_at = new Date();

    await this.requestRepository.save(request);
    await this.sendVerificationEmail(request.verification_email, newCode);
  }
}