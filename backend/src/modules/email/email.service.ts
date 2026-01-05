import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import emailConfig from '../../config/email.config';
import { getPasswordResetEmailTemplate } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    const config = emailConfig();
    
    // Only create transporter if SMTP credentials are provided
    if (config.smtp.auth.user && config.smtp.auth.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass,
        },
      });
      this.logger.log(`✅ SMTP configured successfully: ${config.smtp.host}:${config.smtp.port} (user: ${config.smtp.auth.user})`);
    } else {
      this.logger.error('❌ SMTP credentials not configured. Email sending will be disabled.');
      this.logger.error(`   SMTP_HOST: ${config.smtp.host}`);
      this.logger.error(`   SMTP_PORT: ${config.smtp.port}`);
      this.logger.error(`   SMTP_USER: ${config.smtp.auth.user ? '✅ SET' : '❌ NOT SET'}`);
      this.logger.error(`   SMTP_PASS: ${config.smtp.auth.pass ? '✅ SET' : '❌ NOT SET'}`);
      this.logger.error('   Please set SMTP_USER and SMTP_PASS environment variables to enable email sending.');
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.error('Cannot send email: SMTP not configured');
      throw new Error('Email service is not configured');
    }

    const config = emailConfig();

    try {
      const info = await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      });

      this.logger.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string,
  ): Promise<void> {
    const config = emailConfig();
    const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${resetToken}`;
    
    const { html, text } = getPasswordResetEmailTemplate(resetUrl, userName);

    await this.sendEmail(
      email,
      'Đặt lại mật khẩu - Girl Pick',
      html,
      text,
    );
  }

  /**
   * Strip HTML tags from HTML string to create plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

