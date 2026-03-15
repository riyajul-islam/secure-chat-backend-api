import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Query, Request, Res 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, 
  ApiQuery, ApiParam 
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import PDFDocument from 'pdfkit';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

 @Get()
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get all transactions with stats' })
@ApiQuery({ name: 'page', required: false })
@ApiQuery({ name: 'limit', required: false })
@ApiQuery({ name: 'userId', required: false })
@ApiQuery({ name: 'username', required: false })
@ApiQuery({ name: 'transactionId', required: false }) // নতুন
@ApiQuery({ name: 'paymentMethod', required: false }) // নতুন
@ApiQuery({ name: 'paymentMethodType', required: false }) // নতুন
@ApiQuery({ name: 'type', required: false, enum: ['subscription', 'verification', 'add_fund'] })
@ApiQuery({ name: 'status', required: false })
@ApiQuery({ name: 'currency', required: false, enum: ['usd', 'bdt'] })
@ApiQuery({ name: 'paymentType', required: false })
@ApiQuery({ name: 'dateFrom', required: false })
@ApiQuery({ name: 'dateTo', required: false })
@ApiQuery({ name: 'days', required: false })
async getAllTransactions(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('userId') userId?: string,
  @Query('username') username?: string,
  @Query('transactionId') transactionId?: string, // নতুন
  @Query('paymentMethod') paymentMethod?: string, // নতুন
  @Query('paymentMethodType') paymentMethodType?: string, // নতুন
  @Query('type') type?: string,
  @Query('status') status?: string,
  @Query('currency') currency?: 'usd' | 'bdt',
  @Query('paymentType') paymentType?: string,
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
  @Query('days') days?: number,
) {
  return this.transactionsService.getAllTransactions(page, limit, {
    userId,
    username,
    transactionId, // নতুন
    paymentMethod, // নতুন
    paymentMethodType, // নতুন
    type: type as any,
    status: status as any,
    currency,
    paymentType,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
    days: days ? parseInt(days.toString()) : undefined,
  });
}

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user transactions' })
  async getUserTransactions(@Param('userId') userId: string) {
    return this.transactionsService.getUserTransactions(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiQuery({ name: 'type', required: true, enum: ['subscription', 'verification'] })
  async getTransactionById(
    @Param('id') id: string,
    @Query('type') type: string,
  ) {
    return this.transactionsService.getTransactionById(id, type as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiQuery({ name: 'type', required: true, enum: ['subscription', 'verification'] })
  async deleteTransaction(
    @Param('id') id: string,
    @Query('type') type: string,
  ) {
    await this.transactionsService.deleteTransaction(id, type as any);
    return { message: 'Transaction deleted successfully' };
  }

  @Get('user-info/:identifier')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user information by ID, username, or email' })
  async getUserInfo(
    @Param('identifier') identifier: string,
  ) {
    return this.transactionsService.getUserInfo(identifier);
  }
  

@Get('export/pdf')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Export transactions to PDF' })
async exportToPDF(
  @Res() res,
  @Query('userId') userId?: string,
  @Query('username') username?: string,
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  const { data, stats } = await this.transactionsService.getAllTransactions(1, 1000, {
    userId,
    username,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });

  // PDF ডকুমেন্ট তৈরি
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true,
    info: {
      Title: 'Transaction Report',
      Author: 'Admin Panel',
    }
  });

  // রেস্পন্স হেডার
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=transactions_${new Date().toISOString().split('T')[0]}.pdf`);

  doc.pipe(res);

  // **হেল্পার ফাংশন**
  // Helper functions - সরল এবং নির্ভরযোগ্য
  const formatBDT = (amount) => {
    const num = parseFloat(amount || 0).toFixed(2);
    return `BDT ${num}`;
  };

  const formatUSD = (amount) => {
    const num = parseFloat(amount || 0).toFixed(2);
    return `USD ${num}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // কার্ডে শুধু সংখ্যা দেখানোর জন্য
  const formatNumber = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  // **কম্পানির হেডার**
  doc.rect(50, 45, 500, 15).fill('#4361ee');
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
     .text('TRANSACTION REPORT', 70, 48);
  
  doc.fillColor('#333333');
  
  // **টাইটেল ও রিপোর্ট তথ্য**
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e293b')
     .text('Financial Transactions', 50, 80);
  
  const reportDate = dateFrom && dateTo 
    ? `${formatDate(dateFrom)} - ${formatDate(dateTo)}` 
    : `As of ${formatDate(new Date())}`;
  
  doc.fontSize(10).font('Helvetica').fillColor('#64748b')
     .text(`Generated on: ${formatDate(new Date())} at ${new Date().toLocaleTimeString()}`, 50, 115)
     .text(`Period: ${reportDate}`, 50, 130);

  // **সারাংশ কার্ড (Summary Cards)**
  const cardY = 160;
  
  // Total Transactions Card
  doc.roundedRect(50, cardY, 150, 70, 5).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('TOTAL TXNS', 70, cardY + 15);
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#4361ee').text(data.length.toString(), 70, cardY + 30);
  
  // Total USD Card
  doc.roundedRect(220, cardY, 150, 70, 5).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('TOTAL USD', 240, cardY + 15);
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#2e7d32')
    .text(formatUSD(stats.totalUsd).replace('USD ', ''), 240, cardY + 30); // শুধু সংখ্যা দেখাবে

  // Total BDT Card
  doc.roundedRect(390, cardY, 150, 70, 5).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('TOTAL BDT', 410, cardY + 15);
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#b45309')
    .text(formatBDT(stats.totalBdt).replace('BDT ', ''), 410, cardY + 30); // শুধু সংখ্যা দেখাবে

  // **বিভাগ অনুযায়ী সারাংশ (Category Summary)**
  let summaryY = cardY + 90;
  
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b')
     .text('Summary by Category', 50, summaryY);
  summaryY += 20;
  
  // Subscription Stats
  if (stats.byType?.subscription) {
    doc.rect(50, summaryY, 500, 1).fill('#e2e8f0');
    summaryY += 10;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563eb')
       .text('SUBSCRIPTIONS', 50, summaryY);
    summaryY += 15;
    
    doc.fontSize(9).font('Helvetica');
    Object.entries(stats.byType.subscription.byStatus || {}).forEach(([status, statusData]: [string, any]) => {
      doc.fillColor('#475569').text(`${status.toUpperCase()}: ${statusData.count} txns`, 60, summaryY);
      doc.fillColor('#2e7d32').text(formatUSD(statusData.usd), 250, summaryY, { width: 80, align: 'right' });
      doc.fillColor('#b45309').text(formatBDT(statusData.bdt), 350, summaryY, { width: 80, align: 'right' });
      summaryY += 15;
    });
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.fillColor('#1e293b').text('Subtotal:', 60, summaryY);
    doc.fillColor('#2e7d32').text(formatUSD(stats.byType.subscription.usd), 250, summaryY, { width: 80, align: 'right' });
    doc.fillColor('#b45309').text(formatBDT(stats.byType.subscription.bdt), 350, summaryY, { width: 80, align: 'right' });
    summaryY += 25;
  }
  
  // Verification Stats
  if (stats.byType?.verification && stats.byType.verification.count > 0) {
    doc.rect(50, summaryY, 500, 1).fill('#e2e8f0');
    summaryY += 10;
    
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#7b3fe4')
       .text('VERIFICATIONS', 50, summaryY);
    summaryY += 15;
    
    doc.fontSize(9).font('Helvetica');
    Object.entries(stats.byType.verification.byStatus || {}).forEach(([status, statusData]: [string, any]) => {
      doc.fillColor('#475569').text(`${status.toUpperCase()}: ${statusData.count} txns`, 60, summaryY);
      doc.fillColor('#2e7d32').text(formatUSD(statusData.usd), 250, summaryY, { width: 80, align: 'right' });
      doc.fillColor('#b45309').text(formatBDT(statusData.bdt), 350, summaryY, { width: 80, align: 'right' });
      summaryY += 15;
    });
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.fillColor('#1e293b').text('Subtotal:', 60, summaryY);
    doc.fillColor('#2e7d32').text(formatUSD(stats.byType.verification.usd), 250, summaryY, { width: 80, align: 'right' });
    doc.fillColor('#b45309').text(formatBDT(stats.byType.verification.bdt), 350, summaryY, { width: 80, align: 'right' });
    summaryY += 25;
  }

  // **ট্রানজেকশন তালিকা (Transactions List)**
  doc.rect(50, summaryY, 500, 1).fill('#e2e8f0');
  summaryY += 15;
  
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b')
     .text('Transaction Details', 50, summaryY);
  summaryY += 25;

  // টেবিল হেডার
  const tableTop = summaryY;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
  doc.rect(50, tableTop - 5, 500, 18).fill('#334155');
  
  doc.text('Date', 55, tableTop);
  doc.text('Type', 110, tableTop);
  doc.text('User', 170, tableTop);
  doc.text('Amount', 280, tableTop);
  doc.text('Status', 360, tableTop);
  doc.text('Method', 430, tableTop);

  // টেবিল রো
  let rowY = tableTop + 20;
  doc.fontSize(8).font('Helvetica');

  data.slice(0, 45).forEach((t, index) => {
    // প্রতি ২৫ রো পর নতুন পৃষ্ঠা
    if (index > 0 && index % 25 === 0) {
      doc.addPage();
      rowY = 50;

      // হেডার আবার প্রিন্ট
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
      doc.rect(50, rowY - 5, 500, 18).fill('#334155');
      doc.text('Date', 55, rowY);
      doc.text('Type', 110, rowY);
      doc.text('User', 170, rowY);
      doc.text('Amount', 280, rowY);
      doc.text('Status', 360, rowY);
      doc.text('Method', 430, rowY);
      rowY += 20;
      doc.fontSize(8).font('Helvetica');
    }

    // Date
    doc.fillColor('#1e293b').text(formatDate(t.created_at), 55, rowY);

    // Type
    doc.fillColor('#1e293b').text(t.typeLabel?.substring(0, 12) || '-', 110, rowY);

    // User
    doc.fillColor('#1e293b').text(t.user?.name?.substring(0, 15) || 'N/A', 170, rowY);

    // **Amount - Currency অনুযায়ী রঙ**
    const currency = t.currency?.toLowerCase() || 'usd';
    const amountNum = parseFloat(t.amount || 0).toFixed(2);

    if (currency === 'bdt') {
      doc.fillColor('#b45309'); // কমলা/ব্রাউন - BDT
      doc.text(`BDT ${amountNum}`, 280, rowY);
    } else {
      doc.fillColor('#2e7d32'); // সবুজ - USD
      doc.text(`USD ${amountNum}`, 280, rowY);
    }

    // Status - স্ট্যাটাস অনুযায়ী রঙ
    const statusColor = {
      'pending': '#B6B618',     // কমলা
      'approved': '#2e7d32',     // সবুজ
      'rejected': '#b91c1c',     // লাল
      'escalated': '#7b3fe4',    // বেগুনি
      'auto_approved': '#2563eb', // নীল
      'declined': '#b91c1c'      // লাল
    }[t.status] || '#475569';

    doc.fillColor(statusColor).text(t.status, 360, rowY);

    // Payment Method
    doc.fillColor('#1e293b').text(t.payment_method_type?.substring(0, 8) || '-', 430, rowY);

    rowY += 15;
  });

  // ফুটার (প্রতিটি পৃষ্ঠার নিচে)
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
       .text(`Page ${i + 1} of ${totalPages}`, 50, 770, { align: 'center', width: 500 });
  }

  doc.end();
}

}
