import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailService } from '../../domain/services/email.service.interface';

@Injectable()
export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    username: string,
    token: string,
    host: string,
    protocol: string,
  ): Promise<void> {
    const urlVerifikasi = `${protocol}://${host}/api/auth/verifyemail/${token}`;
    const pesanEmail = `Halo ${username},\n\nSilakan klik link berikut untuk memverifikasi email kamu:\n\n${urlVerifikasi}`;

    await this.transporter.sendMail({
      from: 'FastStock <noreply@faststock.com>',
      to,
      subject: 'Verifikasi Email FastStock',
      text: pesanEmail,
    });
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://faststockfeclone.netlify.app';
    const urlReset = `${frontendUrl}/reset-password?token=${token}`;
    const pesanReset = `Klik link berikut untuk mereset password kamu:\n\n${urlReset}`;

    await this.transporter.sendMail({
      from: 'FastStock <noreply@faststock.com>',
      to,
      subject: 'Reset Password FastStock',
      text: pesanReset,
    });
  }
}
